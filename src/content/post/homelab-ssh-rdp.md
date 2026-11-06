---
title: "公司内网穿透选择：在受限网络下，如何安全、低延迟地 RDP 远程回家"
description: "在受限的公司网络环境下，如何在不安装任何客户端的前提下，安全、低延迟地远程访问家里的 Windows？本文结合实际折腾经验，详细介绍了一套 公益 FRP + SSH 隧道 + RDP 的方案，在保证安全边界与最小暴露面的同时，实现了接近直连的远程体验。"
publishDate: "2025-12-31"
tags: ["HomeLab", "SSH", "FRP", "RDP"]
---



> **问题本身不复杂，复杂的是现实约束。**



## 背景诉求

作为一名高级牛马，我经常需要在公司访问家里的 Windows 开发机，用来浏览器查阅资料、微信、Typora 笔记、Termius 等。

目前的现状是：

- **公司环境：** 电脑安装了监控软件，限制安装额外微信、代理/组网软件（VPN / Tailscale / ZeroTier 全部不可），网络无公网 IPv4/IPv6。
- **家庭环境：** PVE 虚拟化的 Windows，只有 IPv6 公网。

核心诉求是

- 在公司 **通过 RDP 或 Web** 访问家庭 Windows
- 日常操作流畅（打字、拖窗口不卡）
- **安全性**优先，最好支持 MFA
- 尽量不“触发公司风控规则”



## 资源和约束

### 资源

- 日本大板服务器 ×2
  - IPv4 + IPv6
  - 公司 ↔ 日本 ≈ 200ms
  - 家庭 ↔ 日本 ≈ 200ms
- 樱花 FRP / 其他公益 FRP
  - 延迟 ≈ **40ms**

### 约束

- ❌ 公司电脑：**不能装任何额外客户端**（目前连 Tailscale 都不敢继续用）
- ❌ 家庭 Windows：**只有公网 IPv6**
- ✅ 优先 RDP，其次 Web
- ✅ 日常使用要求流畅
- ✅ 安全性要高，最好有 MFA
- ✅ 可选资源只有：**日本服务器 / 公益 FRP**



## 方案对比

| 方案                     | 访问方式 | 客户端依赖 | 延迟   | 安全性 | 结论               |
| ------------------------ | -------- | ---------- | ------ | ------ | ------------------ |
| 日本服务器 + Guacamole   | Web      | 无         | 高     | 高     | ⚠️ 可用，但体验一般 |
| FRP + 家庭 Guacamole     | Web      | 无         | 中     | 高     | ⚠️ 可用，但体验一般 |
| **FRP + SSH 隧道 + RDP** | **RDP**  | 无         | **低** | **高** | **✅ 最优解**       |
| FRP + RDP + multiOTP     | RDP      | 无         | 低     | 很高   | ⭐ 可叠加           |
| 公益 FRP 内置 TOTP       | RDP      | 无         | 低     | 高     | ⚠️ 依赖定制 FRP     |

> 优先解决连接方式和安全边界，而不是功能堆叠



## 最终选择：公益 FRP + SSH 隧道 + RDP

### 整体架构

```
公司电脑（自带 SSH 客户端）
   │
   │ ssh -i key -N -L 13389:WIN:3389
   ▼
公益 FRP（TCP 高位端口）
   │
   ▼
PVE · Debian 跳板机
   │  · 仅 SSH key
   │  · 仅允许访问 Windows:3389
   ▼
家庭 Windows（RDP）
```



### 核心原则

- ❌ Windows 不暴露公网

- ❌ Debian 不能随意访问内网

- ❌ 禁止密码登录

- ❌ 不使用 22 / 3389 等常见端口

- ✅ Windows 启用 NLA，使用非管理员账户

  ✅ 可选叠加 Windows 端 MFA（multiOTP）

- ✅ 所有流量必须：FRP → SSH → 指定 RDP

- ✅ SSH 权限最小化（只做端口转发），通过防火墙锁死出口，只允许访问 Windows 的 3389，防止跳板机沦陷后内网被横向渗透。



## 公益 FRP + SSH 隧道方案实施

### 基础设施搭建

#### 跳板机系统选择

- Debian 12 minimal
- 1C / 2G / 32GB 磁盘足够

#### 基础系统加固

```bash
apt update && apt upgrade -y
apt install -y openssh-server ufw fail2ban curl
```

#### 用户职责划分

为了安全，我们将“管理权限”和“隧道权限”分开。

- `tunnel`：只允许端口转发
- `debian`：运维备用账号

```bash
# tunnel 用户：仅用于建立隧道，无 Shell 权限
adduser tunnel
usermod -aG sudo tunnel
# debian-cc 用户：管理员，用于维护系统
adduser debian
usermod -aG sudo debian
```

------

### SSH 安全加固

#### tunnel 用户（公司 → 跳板机）

在公司电脑生成密钥对，将公钥上传至 Debian 的 `/home/tunnel/.ssh/authorized_keys`

```bash
ssh-keygen -t ed25519 -f id_frp_ssh
```

`authorized_keys` 中强制限制能力：我们需要配置 SSH，使得公司电脑连接时，**只能**做端口转发，**不能**执行命令，且**只能**转发到家里的 Windows IP。

```text
restrict,port-forwarding,permitopen="192.168.31.120:3389" ssh-ed25519 AAAA...
```

这个 key：

- ❌ 不能 shell
- ❌ 不能转发其他端口
- ✅ 只能指向 Windows RDP，即使黑客拿到了私钥，他也连不上内网的其他设备

#### SSH 服务端限制

编辑 `/etc/ssh/sshd_config`，修改 SSH 端口为高位端口（防扫描），并禁用密码登录。

```shell
Port 53822                  # 高位端口
PermitRootLogin no          # 禁止 Root
PasswordAuthentication no   # 禁止密码
ChallengeResponseAuthentication no
PubkeyAuthentication yes    # 只认 Key
AllowUsers tunnel debian    # 白名单用户

# 针对管理员：允许 Shell，禁止转发
Match User debian
    PermitTTY yes
    AllowTcpForwarding no

# 针对隧道用户：禁止 Shell，限制转发目标
Match User tunnel
    AllowTcpForwarding yes
    PermitOpen 192.168.31.120:3389
    X11Forwarding no
    AllowAgentForwarding no
    PermitTTY no
```

*配置完成后重启 SSH 服务：`systemctl restart ssh`*

#### 防火墙策略

验证原则只有一条：

> **跳板机只能访问 Windows，不能访问任何其他内网。**

```bash
# 1. 默认策略：拒绝入站，默认允许出站(稍后限制)
ufw default deny incoming
ufw default allow outgoing

# 2. 允许 FRP 流量进出（SSH端口）
ufw allow 53822/tcp

# 3. 精细化出站规则 (Output Chain)
# 允许 Debian 访问 Windows 的 RDP
ufw allow out to 192.168.31.120 port 3389 proto tcp

# 允许访问网关 (DNS/路由需要)
ufw allow out to 192.168.31.1

# 拒绝访问内网其他所有 IP (防止横向移动)
ufw deny out to 192.168.31.0/24

# 启用防火墙
ufw enable
```



#### Fail2ban

配置 /etc/fail2ban/jail.local 监控 53822 端口，错误尝试 2 次即封禁 24 小时。因为公网暴露 SSH 必然会被扫描，这是最后一道防线。

```ini
[sshd]
enabled = true
port = 53822
maxretry = 2
bantime = 24h
```



#### 关于 Windows 安全的建议

虽然 RDP 不暴露公网，但还是建议对目标 Windows 进行加固：

1. **启用 NLA (网络级别身份验证)**。
2. **创建非管理员用户**用于远程登录。
3. **强密码策略**。
4. **(进阶)** 配合 MultiOTP 软件，在 Windows 登录时强制要求 MFA 动态口令，进一步提升安全性。



### 内网穿透配置 (FRP)

使用低延迟的国内公益 FRP（如樱花 FRP / Nyat 等），将 Debian 的 SSH 端口暴露出去。

#### 安装 FRPC

```bash
# 切换到 tunnel 用户安装，避免使用 root
su - tunnel
wget https://github.com/fatedier/frp/releases/download/v0.56.0/frp_0.56.0_linux_amd64.tar.gz
# ...解压并移动到 /usr/local/bin/frpc
```

#### 配置文件 (`/etc/frpc.toml`)

我们**不直接穿透 RDP (3389)**，而是穿透 **SSH (53822)**。

```toml
serverAddr = "rdp.example.com" # FRP 服务端地址
serverPort = 7000
user = "your_user_id"
auth.token = "your_token"

[[proxies]]
name = "tunnel_ssh"
type = "tcp"
localIP = "127.0.0.1"
localPort = 53822
remotePort = 53389
```

#### 设为系统服务

创建 `/etc/systemd/system/frpc.service` 并启动，确保断电重启后自动上线。



### 公司电脑使用方式

在公司电脑上，不需要安装任何软件，只需要一个 SSH 私钥文件（`id_frp_ssh`）。

#### 建立隧道

打开 PowerShell 或 CMD：

```bash
ssh -i id_frp_ssh -N \
  -L 13389:192.168.31.120:3389 \
  -p 53389 tunnel@frp.example.com
```

- `-N`: 不执行远程命令（仅转发）。
- `-L 13389:IP:3389`: 将本地的 13389 端口映射到家中 Windows 的 3389。

#### 连接 RDP

打开 Windows 自带的“远程桌面连接”

```text
mstsc → 127.0.0.1:13389
```



## 实际体验

- **延迟：** 既然走的是国内/周边节点的 FRP，物理延迟极低（约 40ms），打字跟手，拖动窗口无残影。
- **安全：** 公司防火墙只看到一个普通的 TCP 连接；所有数据经过 SSH 加密；家里的 Windows 没有任何端口暴露在公网。
- **合规：** 没有在公司电脑安装任何未经授权的 `.exe` 或 VPN 客户端。



## 写在最后

其实这套方案有点过于设计了，对大多数人来说，数据也没那么值钱，没必要整的那么复杂。

或者说折腾本身，才是最大的收获。

