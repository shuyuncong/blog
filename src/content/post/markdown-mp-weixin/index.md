---
title: "程序员的写作环境111"
description: "使用本地 markdown 文件和坚果云同步，通过 Typora 管理笔记目录，并定期备份到 GitHub，确保数据安全和易访问性"
publishDate: "2023-06-06"
tags: ["公众号", "写作"]
draft: true
---

#### 前言

目前我在用的笔记系统，用一句很简单的话概括就是：本地 markdown 文件 + 坚果云同步，用 typora项目把整个笔记目录管理起来。同时定时备份到github上。

使用这种方案的好处：

- 数据完全属于自己，github + 坚果云双重措施可以确保笔记不会丢失，也能通过历史追溯查看笔记系统的生长过程；
- 坚果云的多设备同步近乎实时，并且增量同步非常适合 markdown 这种轻量文本，typora也提供非常好的书写体验；
- markdown 是一种「源文件」，可以转换为各种格式输出。可以直接发到Hexo 博客，也可以直接发布到公众号（我现在正用 Typora 写这篇文章），「一处写作，多处发布」；

当然 「本地 markdown 文件」这种方案也有一些不便：

- 缺少好用的移动端（iOS/Android），不过我在手机上很少直接编辑笔记，大部分只是用来查阅。
- 对图片、表格支持不太好；图片我们可以使用图床。表格的话，Markdown 语法也支持基本表格。
- 不支持复杂排版。

但总归还是符合自己的才是最好的，大厂的笔记产品，虽然有靠谱的技术保证服务稳定性，但也有潜在的不便，比如被和谐，我不想把资料交到别人手里。

#### GitHub 配置过程

首先要在GitHub创建一个用作图床的仓库，我的仓库名为 mdImg。

![image-20220701215546695](https://cdn.jsdelivr.net/gh/shuyuncong/mdImg@c4686adbb8fe2e65932056907a615615e6c44f88/md/image/202208162242367.png)

填写相关信息

![image-20221005153551847](https://cdn.jsdelivr.net/gh/shuyuncong/mdImg@c4686adbb8fe2e65932056907a615615e6c44f88/md/image2022/202210051535971.png)

创建一个密匙来实现远程图片上传，点头像，选setting

![image-20220701222032296](https://cdn.jsdelivr.net/gh/shuyuncong/mdImg@c4686adbb8fe2e65932056907a615615e6c44f88/md/image/202208162242236.png)

点Developer settings

![image-20220701222200095](https://cdn.jsdelivr.net/gh/shuyuncong/mdImg@c4686adbb8fe2e65932056907a615615e6c44f88/md/image/202208162242394.png)

选择`Personal access tokens`，并且选择`Generate new toekn`创建一个新的密匙

![image-20221005120048091](https://cdn.jsdelivr.net/gh/shuyuncong/mdImg@c4686adbb8fe2e65932056907a615615e6c44f88/md/image2022/202210051200175.png)

输入GitHub密码之后，进入token的配置页面，配置如下，最后点最下方绿色按钮创建

![在这里插入图片描述](https://cdn.jsdelivr.net/gh/shuyuncong/mdImg@c4686adbb8fe2e65932056907a615615e6c44f88/md/image/202208162242857.png)

把token保存一下，我写到了备忘录里。因为这个token只会显示一次。

![image-20220701222919186](https://cdn.jsdelivr.net/gh/shuyuncong/mdImg@c4686adbb8fe2e65932056907a615615e6c44f88/md/image/202208162242224.png)

#### PicGo 配置过程

打开picgo，找到GitHub图床，进行如下配置，并设置为默认图床

![image-20221005113337968](https://cdn.jsdelivr.net/gh/shuyuncong/mdImg@c4686adbb8fe2e65932056907a615615e6c44f88/md/image2022/202210051133055.png)

设定自定义域名：不填写，加载速度会有点慢，可能会导致你typora的显示很慢甚至显示不出来，但是在博客转存的时候好像没什么问题；CDN加速：`https://cdn.jsdelivr.net/gh/GitHub账户名/仓库名`，如果这个加速不可以，可以尝试在链接末尾添加**@master**，`https://cdn.jsdelivr.net/gh/GitHub账户名/仓库名@mater`大家可以试试。

PicGo 设置

在PicGo设置中勾选 `时间戳重命名` 否则上传同名文件PicGo会报错

![image-20220701224339922](https://cdn.jsdelivr.net/gh/shuyuncong/mdImg@c4686adbb8fe2e65932056907a615615e6c44f88/md/image/202208162243103.png)

#### Typora 配置

文件->偏好设置

在图像设置里进行设置，然后点验证图片上传

![image-20220701224625068](https://cdn.jsdelivr.net/gh/shuyuncong/mdImg@c4686adbb8fe2e65932056907a615615e6c44f88/md/image/202208162243505.png)

点击验证图片上传选项，出现下图说明上传成功

![image-20220701230008834](https://cdn.jsdelivr.net/gh/shuyuncong/mdImg@c4686adbb8fe2e65932056907a615615e6c44f88/md/image/202208162243181.png)

祝你好运！