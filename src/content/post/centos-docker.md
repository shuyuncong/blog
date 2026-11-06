---
title: "CentOS 7 系统安装 Docker "
description: "CentOS 7 系统安装 Docker：包括准备工作、更换国内源、安装Docker、配置镜像加速、验证安装等几个主要部分"
publishDate: "2025-08-01"
tags: ["CentOS", "Docker"]

---



### 🔧 **一、准备工作**

1. **系统要求**

   - CentOS 7 64 位，内核版本 ≥ 3.10（通过 `uname -r` 检查）16。
   - 网络连通性（确保可访问国内镜像站）。

2. **卸载旧版 Docker**（如存在）

   ```bash
   sudo yum remove docker \
                  docker-client \
                  docker-client-latest \
                  docker-common \
                  docker-latest \
                  docker-latest-logrotate \
                  docker-logrotate \
                  docker-engine
   ```

------

### 🔄 **二、配置国内 Yum 源（加速依赖安装）**

**推荐选择以下任一源**：

1. **清华源**

   ```bash
   sudo sed -e 's|^mirrorlist=|#mirrorlist=|g' \
            -e 's|^#baseurl=http://mirror.centos.org|baseurl=https://mirrors.tuna.tsinghua.edu.cn/centos|g' \
            -i.bak /etc/yum.repos.d/CentOS-*.repo
   ```

2. **华为源**

   ```bash
   sudo curl -o /etc/yum.repos.d/CentOS-Base.repo https://mirrors.huaweicloud.com/repository/conf/CentOS-7-reg.repo
   sudo yum clean all && sudo yum makecache
   ```

------

### 📦 **三、安装 Docker CE**

1. **安装依赖工具**：

   ```bash
   sudo yum install -y yum-utils device-mapper-persistent-data lvm2
   ```

2. **添加 Docker CE 国内仓库**：

   - **阿里云仓库**

     ```bash
     sudo yum-config-manager --add-repo https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
     ```

   - **华为云仓库**

     ```bash
     sudo yum-config-manager --add-repo https://mirrors.huaweicloud.com/docker-ce/linux/centos/docker-ce.repo
     ```

3. 获取 GPG 密钥失败（如果出现）

   ```bash
   1. 删除可能已添加的官方仓库（如果之前尝试过）
   sudo rm -f /etc/yum.repos.d/docker-ce.repo
   
   2. 添加阿里云仓库（包含国内可访问的 GPG 密钥）
   sudo yum-config-manager --add-repo https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
   
   3. 手动导入阿里云的 Docker GPG 密钥
   sudo rpm --import https://mirrors.aliyun.com/docker-ce/linux/centos/gpg
   # 通过清华源获取密钥
   # sudo rpm --import https://mirrors.tuna.tsinghua.edu.cn/docker-ce/linux/centos/gpg
   
   4. 验证密钥是否导入成功
   sudo rpm -qi gpg-pubkey-621e9f35-* | grep -E "Name|Install Date"
   
   ```

   

4. **安装 Docker**：

   ```bash
   sudo yum install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
   ```

5. **启动并设置开机自启**：

   ```bash
   sudo systemctl start docker
   sudo systemctl enable docker
   ```

------

### ⚡ **四、配置 Docker 镜像加速**

修改 `/etc/docker/daemon.json`，添加国内镜像源（**任选其一**）：

```bash
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",    # 中国科技大学
    "https://hub-mirror.c.163.com",          # 网易
    "https://registry.docker-cn.com",        # Docker 中国
    "https://dockerhub.mirrors.huaweicloud.com" # 华为云
  ]
}
EOF
```

**应用配置**：

```bash
sudo systemctl daemon-reload
sudo systemctl restart docker
```

------

### ✅ **五、验证安装**

1. **检查版本与运行状态**：

   ```bash
   docker --version              # 查看版本
   sudo systemctl status docker   # 检查服务状态
   ```

2. **测试运行容器**：

   ```bash
   docker run hello-world         # 应输出 "Hello from Docker!"
   ```

3. **确认加速器生效**：

   ```bash
   docker info | grep "Registry Mirrors" -A 2
   ```















