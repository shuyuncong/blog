---
title: "缓存双写一致性问题与分布式锁解决方案"
description: "在使用缓存的场景中，缓存与数据库双写不一致问题经常会发生。特别是当我们对缓存和数据库执行更新操作时，往往会遇到以下问题"
publishDate: "2024-09-27"
tags: ["工作", "Redis", "缓存一致性"]

---

在使用缓存的场景中，**缓存与数据库双写不一致问题**经常会发生。特别是当我们对缓存和数据库执行更新操作时，往往会遇到以下问题：

- **先更新缓存再更新数据库**：如果缓存更新成功，而数据库更新失败，缓存中会有脏数据，导致数据不一致。
- **先更新数据库再更新缓存**：如果数据库更新成功，而缓存更新失败，缓存中的数据仍然是旧数据。
- **并发环境下读写操作的交错执行**：在删除缓存、写入数据库的过程中，新的读请求获取到了旧的数据库数据并放入缓存，此时就出现了数据不一致的现象。

## 延时双删方案

为了避免上述问题，通常采用一种策略：**延时双删**。

1. **第一次删除缓存**：在更新数据库之前，先删除缓存。
2. **更新数据库**：更新数据库中的数据。
3. **再次删除缓存**：为了防止并发读导致旧数据重新写入缓存，再删除一次缓存。



比如我现在在京东抢投影仪，大部分时候都是用户在查询商品信息，是典型的**读多写少**的场景，可以利用缓存。

```java
//根据id查询商品信息  
public GoodsVO loadGoodsInfoById(Long id) {
  //从redis中拿用户信息
  Object obj = redisTemplate.opsForValue().get(GOODS_KEY + id);
  if(obj == null) {
      //如果redis中不存在，就从数据库中获取
      GoodsVO goods = loadGoodsFromDb(id);
      //将结果保存到redis中
      redisTemplate.opsForValue().set(GOODS_KEY+id,JSONUtil.toJsonPrettyStr(goods));
      return fileUser;
  }
  return JSONUtil.toBean(obj.toString(), GoodsVO.class);
}

```

```java
//编辑商品信息
public void modifyGoodsById(GoodsVO goodsVO) {
    // 删除缓存
    redisTemplate.delete(GOODS_KEY + goodsVO.getId());
    // 更新商品信息
    goodsMapper.updateById(goodsVO);
    // 删除缓存，业务组自己评估休眠时间
    Thread.sleep(1000);
    redisTemplate.delete(GOODS_KEY + goodsVO.getId());
}

```

## 延时双删问题：

- **缓存更新延迟问题**：第一次删除缓存后，在数据库更新前，其他线程（Thread-B）可能从数据库中读取旧数据并写入缓存。如果第二次删除缓存失败，缓存中的数据会与数据库不一致。
- **数据库负载问题**：如果并发量很大，多个线程同时发现缓存中没有数据，会同时查询数据库，导致数据库负载增加，甚至可能宕机。

## 分布式锁

为了解决缓存双写一致性问题，我们可以引入**分布式锁**来进行控制。在高并发的场景中，保证数据的一致性和防止缓存与数据库之间的写-读竞争。

### 读操作 - 查询商品信息

当我们查询商品信息时，首先尝试从缓存中读取数据。如果缓存中没有数据（缓存穿透），则加锁后从数据库中查询并更新缓存。

```java
// 根据商品ID查询商品信息
public GoodsVO loadGoodsInfoById(Long id) {
  // 从缓存中获取数据
  Object obj = redisTemplate.opsForValue().get(GOODS_KEY + id);
  if (obj == null) {
      // 缓存中没有数据时，从数据库获取
      GoodsVO goods = loadGoodsFromDb(id);
      return goods;
  }
  return JSONUtil.toBean(obj.toString(), GoodsVO.class);
}

// 从数据库加载商品信息，带分布式锁
public GoodsVO loadGoodsFromDb(Long id) {
    // 获取分布式锁，防止并发查询数据库
    boolean lock = redisLock.tryLock(GOODS_KEY + id);
    if (!lock) {
        throw new GlobalException("访问频繁，请稍后再试");
    }
    try {
        GoodsVO goods = goodsMapper.selectById(id);
        if (goods == null) {
            // 解决缓存穿透，将空值放入缓存
            redisTemplate.opsForValue().set(GOODS_NULL_KEY + id);
            return null;
        }
        // 将数据写入缓存
        redisTemplate.opsForValue().set(GOODS_KEY + id, JSONUtil.toJsonPrettyStr(goods));
        return goods;
    } finally {
        redisLock.unLock(GOODS_KEY + id);
    }
}

```

### 写操作 - 修改商品信息

当我们修改商品信息时，需要先获取分布式锁，保证没有其他线程在同时读取或修改这条数据。更新数据库后，及时更新缓存中的数据。

```java
// 编辑商品信息
public void modifyGoodsById(GoodsVO goodsVO) throws Exception {
    // 获取分布式锁
    boolean lock = redisLock.tryLock(GOODS_KEY + goodsVO.getId());
    if (!lock) {
        throw new GlobalException("更新数据失败，请稍后再试...");
    }
    try {
        // 删除缓存，避免读取到旧数据
        redisTemplate.delete(GOODS_KEY + goodsVO.getId());
        // 更新数据库
        goodsMapper.updateById(goodsVO);
        // 更新缓存，
        redisTemplate.opsForValue().set(GOODS_KEY + goodsVO.getId(), JSONUtil.toJsonPrettyStr(goodsVO));
    } finally {
        redisLock.unLock(GOODS_KEY + goodsVO.getId());
    }
}

```

## 优化建议：

针对修改商品信息删缓存这一块还是有一些问题，如果事先删除缓存，可能会导致大量请求访问缓存失败；如果不删除缓存，导致读取的缓存是旧数据。还是看业务取舍问题。

**删除缓存更新缓存（有锁）**：适用于对一致性要求严格的场景，能接受短暂的读取缓存失败。

**删除缓存异步更新（有锁）**：适用于对一致性要求严格的场景，直接更新缓存可以减少缓存击穿的情况，通过异步删除减少锁竞争。

**缓存更新而不删除（有锁）**：适用于对一致性要求不严格的场景，直接更新缓存可以减少缓存击穿的情况。

**延时双删 + 异步删除缓存（无锁）**：适用于对一致性要求不严格的场景、并发量比较大的场景，通过异步删除减少锁竞争。





  







