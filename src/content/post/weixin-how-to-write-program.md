---
title: "我是如何写小程序的"
description: "主要介绍了如何注册和开发微信小程序的详细流程。从注册账号、完善信息，到使用开发者工具创建页面和添加交互功能，最后上传并发布小程序。文章还涵盖了注册注意事项、配置开发环境以及简要的开发示例。"
publishDate: "2024-06-15"
tags: ["公众号", "小程序"]
---

#### 小程序注册

1、在微信公众平台官网首页（mp.weixin.qq.com）点击右上角的“立即注册”按钮。

![62778860de90b90c887f99ff5624d194.png (1920×937)](https://cdn.jsdelivr.net/gh/suyuncong/mdImg/md/image2022/202210041129882.png)

选择注册的账号类型

选择“小程序”，点击“查看类型区别”可查看不同类型账号的区别和优势。

![img](https://cdn.jsdelivr.net/gh/suyuncong/mdImg/md/image2022/202210041129567.png)

注册注意:需使用未注册过的邮箱。 

![image-20221004161919798](https://cdn.jsdelivr.net/gh/suyuncong/mdImg/md/image2022/202210041619986.png)

提交注册信息后，页面会跳转到“**邮箱激活**”，登录自己的邮箱去激活。

![img](https://cdn.jsdelivr.net/gh/suyuncong/mdImg/md/image2022/202210041620034.png)

注册完毕后需要确认主体，主体确认后不可更改。

![img](https://cdn.jsdelivr.net/gh/suyuncong/mdImg/md/image2022/202210041621145.jpeg)

以下操作以“个人”**主体类型**为例：选择“个人”填写主体信息登记，按照上页面提示**如实填写**，必须实名填写。

填写信息后点击“**继续**”，会出现下面的提示。



![img](https://cdn.jsdelivr.net/gh/suyuncong/mdImg/md/image2022/202210041624734.png)

点击确定后，它会提示提交成功，进入小程序。



![img](https://cdn.jsdelivr.net/gh/suyuncong/mdImg/md/image2022/202210041624680.png)



至此说明小程序已**注册成功**，页面会跳转到小程序账号的页面。

#### 信息完善

点击“填写”**补充**小程序的**基本信息**，基本信息填写完整才能进入开发设置去获取**APPID**、**APPSECRET**。



点击“**添加开发者**”增加小程序的项目成员，配置成员的权限，由成员管理小程序，但是管理员人只有一人。设置-开发者设置，保存**APPID**、**APPSECRET。**

![image-20221004162737417](https://cdn.jsdelivr.net/gh/suyuncong/mdImg/md/image2022/202210041627521.png)

#### 小程序应用开发



下载**微信开发者工具**并登录，开发者工具上输入APPID（即微信小程序ID）、项目名称（填写字母） 、项目目录（选择代码包解压后的首目录）。

![image-20221004163539738](https://cdn.jsdelivr.net/gh/suyuncong/mdImg/md/image2022/202210041635874.png)

对应资源包很简单，可以在官网上学习一下教程；也可以直接后台找我要一份。

点击刚刚上传的项目，进入调试界面，确认体验是否正常。

![image-20221004164055597](https://cdn.jsdelivr.net/gh/suyuncong/mdImg/md/image2022/202210041640755.png)

确认无误，填写版本号及项目备注，点击上传。

![image-20221004164227597](https://cdn.jsdelivr.net/gh/suyuncong/mdImg/md/image2022/202210041642678.png)

最后返回腾讯小程序后台，点击“提交审核”，等审核通过以后，即可发布上线。

![image-20221004164303075](https://cdn.jsdelivr.net/gh/suyuncong/mdImg/md/image2022/202210041643463.png)

如果不做更深入的开发或者自己尝试修改，到这儿就可以结束了。

#### 尝试自己修改

正常大家使用的小程序其实都是有后台服务的，这时候我们就需要有一台属于自己的服务器，最好我们也申请一个域名，用于处理后续事宜。

当然对应我们目前这个小程序来说是不需要的。

##### json文件

```
json 主要以两侧的 { } 为代表，在 json 文件中，我们一般会通过 key -value 的方式来表达数据，而 value 的值一般会被放在双引号中。
修改编辑 json文件时需要严格遵守相关的数据格式（比如不能添加注释，不能使用单引号），否则会编译失败。
```

![image-20221004171842362](https://cdn.jsdelivr.net/gh/suyuncong/mdImg/md/image2022/202210041718518.png)

在 `app.json` 文件中，会包括当前小程序的全局配置，也是在这里对小程序的所有页面路径，界面样式等信息进行配置的综合入口。

在上图中我们会看到一共有 4 个字段（即 pages，window，style 和 sitemap），其中 pages 用来描述当前小程序中所有的页面路径，windows 字段用来定义小程序中的页面顶部颜色，**所显示的名称**等，style 字段用来约束小程序中组件的默认使用样式，而 sitemap 字段则用来控制小程序可被索引的内容。

pages 字段是配置文件中**唯一必须**的字段。所有小程序中的页面都需要在 app.json 中进行注册（即在 pages 这个数组下添加对应的路径）。

##### 创建页面

![image-20221004173649422](https://cdn.jsdelivr.net/gh/suyuncong/mdImg/md/image2022/202210041736576.png)

在创建页面时，也不需要单独在新增的目录中新增 wxss，wxml，js 和 json 文件，我们仅右键pages，并点击「创建 page」输入页面名称，即可自动完成新目录的创建。

通过「创建 page」的形式新建页面，FIDE 会自动将页面文件增加到 app.json 文件中，而如果是通过手动创建页面的形式，则需要开发者自行将页面在 app.json 文件中进行注册。而如果我们需要删除某个页面目录，则也需要在 app.json 文件中清空对应的页面路径。

##### js文件

在一个小程序中，如果只有界面展示是完全不够的，还需要增加一些用户交互的响应内容，而这些与用户交互相关的脚本（如响应用户的点击、获取用户的位置等等）则需要通过 JS 脚本文件来进行处理。例如我们的“提交”按钮。

![image-20221004174104272](https://cdn.jsdelivr.net/gh/suyuncong/mdImg/md/image2022/202210041741503.png)

在 index.wxml 中，我们增加表单的提交事件submit。

再让我们切换到 index.js 中，为 提交按钮增加后续的交互动作，通过 wx.navigateTo 来增加跳转逻辑，

```
Page({
  onShareAppMessage() {
    return {
      title: 'form',
      path: 'page/component/pages/form/form'
    }
  },
  formSubmit(e) {
    wx.navigateTo({
      url: '../stu/stuManaView?current=' + JSON.stringify(e.detail.value)
    })
    wx.setStorage({
      key:"localInfo",
      data:e.detail.value
    })
  }
})
```

为了避免每次都重复输入，我们添加了本地缓存，

```
/**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let val = wx.getStorageSync('localInfo');//获取登陆信息的缓存
    if(val){
      console.log(val)
      this.setData({
        usercode:val.usercode,
        username:val.username
      })
    }
  },
```

自此，我们的基本功能就有了，不放心的小伙伴可以真机调试一波。

![image-20221004174954304](https://cdn.jsdelivr.net/gh/suyuncong/mdImg/md/image2022/202210041749413.png)

剩下的，点击上传，提交审核就可以了。

祝你成功！