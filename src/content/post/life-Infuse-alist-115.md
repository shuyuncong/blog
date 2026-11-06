---
title: "Infuse + alist + 115，打造影音海报墙"
description: "本文分享了一个无需 NAS 的私人影视库搭建方案，结合 115网盘、AList 和 Infuse，通过云端存储和灵活挂载，实现随时随地观看影视资源的便捷体验。文章详细介绍了 Alist 的安装步骤、115 网盘的配置方法以及 Infuse 的使用技巧，帮助读者打造出高效美观的影音海报墙。"
publishDate: "2024-09-09"
tags: ["NAS", "影音海报墙", "生活"]
---



## 缘起

之前在群晖DS224+上搭建过 Emby，影音效果是很好地满足了，但有如下问题

- 容量有限，只有固定个数的槽位，如果做raid的话，实际容量更小
- 大部分影视资源不具有收藏价值，保存一些容易被和谐的就可以了
- 一直开着有硬盘噪音，还耗电
- 影片需要下载，不能立即观看

综上，准备把NAS从影音库解放出来，专职做备份就好了。

后来使用的是 Infuse + 阿里云盘，但现在阿里云盘已经限速了，这个方案也被放弃了。

于是有了今天的主题，115 + AList + Infuse 配置。

### 为什么选择 115 + Alist + Infuse？

- **115网盘**：空间大，支持离线下载功能，几乎是所有网盘中表现最好的。
- **AList**：支持多种存储类型，提供灵活的挂载接口，速度快，体验佳。
- **Infuse**：一款出色的播放器，支持杜比、HDR等高级特效，海报墙视觉体验出色，数据来源于 TheMovieDB。

## 整体方案



放弃传统的 NAS 方案后，我们将影片存储在云端，并通过公网服务器部署 AList，不需要安装 Emby、Plex、Jellyfin 等影音服务器软件。你只需使用 Infuse 或支持 WebDAV 的播放器来解析并播放影视资源。

- **成本**：网盘会员费用 + 公网服务器服务费
- **优点**：AList 支持挂载多种网盘，直连速度非常快，配置简单

![1725805039427](https://cdn.jsdelivr.net/gh/shuyuncong0/mdImg/md/image2024/202409082217654.jpg)



## Alist 安装

你可以通过群晖 NAS 套件或服务器 Docker 安装 AList。这里我演示如何使用群晖套件库安装 AList 并通过 IPv6 + 动态 DDNS 实现外网连接。

1. 打开[矿神的套件库](https://spk7.imnks.com/)。
2. 在套件库中搜索 **AList** 并安装。

> 注意：第三方套件安装存在一定风险，需自行判断是否同意。

安装后，使用默认账号 `admin` 和密码 `alist` 登录后台，建议修改密码并创建新的用户以增强安全性

![image-20230301101504729](https://cdn.jsdelivr.net/gh/shuyuncong0/mdImg/md/image2024/202409092114616.png)

![image-20230301101833104](https://cdn.jsdelivr.net/gh/shuyuncong0/mdImg/md/image2024/202409092114227.png)



![image-20230301102033029](https://cdn.jsdelivr.net/gh/shuyuncong0/mdImg/md/image2024/202409092114795.png)



### 调整 Guest 账号

默认的 **guest** 账号可以浏览文件，因此建议将其基本路径设置为一个空文件夹，以避免暴露文件。

![image-20230301102742568](https://cdn.jsdelivr.net/gh/shuyuncong0/mdImg/md/image2024/202409092115712.png)

## 115 网盘配置



![image-20240909214126046](https://cdn.jsdelivr.net/gh/shuyuncong0/mdImg/md/image2024/202409092141162.png)

### Cookie 获取

使用谷歌浏览器，安装“篡改猴”扩展

![Alist添加挂载115网盘超稳定的办法](https://cdn.jsdelivr.net/gh/shuyuncong0/mdImg/md/image2024/202409092125865.png)

安装成功后在“篡改猴”中搜索并安装“115不大助手”脚本

![Alist添加挂载115网盘超稳定的办法](https://cdn.jsdelivr.net/gh/shuyuncong0/mdImg/md/image2024/202409092125040.png)

![Alist添加挂载115网盘超稳定的办法](https://cdn.jsdelivr.net/gh/shuyuncong0/mdImg/md/image2024/202409092125646.png)

登录 115 网盘，扫描二维码并获取 Cookie

![Alist添加挂载115网盘超稳定的办法](https://cdn.jsdelivr.net/gh/shuyuncong0/mdImg/md/image2024/202409092125396.png)

扫码获取Cookie

![image-20240909212935746](https://cdn.jsdelivr.net/gh/shuyuncong0/mdImg/md/image2024/202409092129873.png)

选一个你不会第二次用到的方式，我这里使用的是安卓。

将获取到的 Cookie 复制粘贴到 AList 后台，完成挂载设置。

![image-20240909213209123](https://cdn.jsdelivr.net/gh/shuyuncong0/mdImg/md/image2024/202409092132313.png)

填好 Cookie ， 在 Qrcode 源选一个你不会用到的，保存就挂载成功了。



## 配置 Infuse：海报墙视觉盛宴

打开 **Infuse**，进入【文件】->【新增文件来源】->【已存储的共享】->【添加 WebDAV】。

+   **名称**：自定义
+   **位址**： 你的 IP 地址
+   **用户名/密码**： Alist 的用户名和密码
+   **路径**: /dav
+   **端口**: 5244



完成后，Infuse 将会显示所有挂载的影视资源，自动生成海报墙，提供极致观影体验。

![img](https://cdn.jsdelivr.net/gh/shuyuncong0/mdImg/md/image2024/202409082118020.png)

Infuse 不是必选项，市面上有很多替代品。目前比较常见的媒体管理软件有:

+   Infuse: 体验最好，支持海报墙，支持杜比和HDR，界面设计精美
+   Filmly：自动刮削封面海报，速度还挺快
+   Fileball: 免费、页面简洁，但不支持海报墙，可以直连 Emby和 jellyfin
+   Vidhub: 体验还行，支持海报墙，总感觉差点意思

这个是 Filmly 移动端下展示效果，还不错

<img src="https://cdn.jsdelivr.net/gh/shuyuncong0/mdImg/md/image2024/202409092203935.png" alt="65101bab3abf659c5aadb53b5ffbc7c" style="zoom:40%;" />

## 常见问题

**资源更新未刷新**：手动在 AList 后台点击刷新，更新资源。

**字幕无法加载**：确保影片与字幕文件在同一文件夹，且文件名一致。

**多设备播放进度无法同步**：确保设备登录的是同一个 iCloud 账号，Infuse 会自动同步播放进度。






祝你好运！





