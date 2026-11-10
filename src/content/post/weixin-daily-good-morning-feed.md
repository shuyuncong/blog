---
title: "微信公众号每日早安推送，给对象的浪漫礼物"
description: "如何通过服务器版和免服务器版来实现向对象发送浪漫的微信模板消息。还提到了如何使用GitHub Actions实现免服务器版的定时任务推送，使得即使不懂编程的人也可以轻松实现定时发送功能。"
publishDate: "2024-06-05"
tags: ["公众号", "微信推送", "浪漫"]
---


### 前言

冬天到了，送给对象一个浪漫的礼物吧，感动对象一冬天。/狗头保命

![image-20221006095557079](https://cdn.jsdelivr.net/gh/shuyuncong/mdImg@c4686adbb8fe2e65932056907a615615e6c44f88/md/image2022/202210060955306.png)

之前在某音平台上刷到了这个，那必须给对象整一个。讲真这个已经让我运行了一段时间了，只是现在才写出来。

### 服务器版

本篇文章的源码是在该CSDN博主- 东东学不会分享的源码基础上稍加修改的。

#### 注册微信公众号

> 正常企业开发，实现微信模版消息推送，必须要有微信公众号、备案的网址，并且最麻烦的一点是要获取到用户的openid；
> 作为个人，这些条件基本上都不具备。所以今天只能使用测试账号实现微信模版消息推送。

微信扫码登录下面网址

```
 https://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=sandbox/login
```

 扫码登录成功后，就会给我们生成微信公号的appid和appsecret

![image-20221005182428422](https://cdn.jsdelivr.net/gh/shuyuncong/mdImg@c4686adbb8fe2e65932056907a615615e6c44f88/md/image2022/202210051824541.png)

让你的女朋友或者男朋友扫码关注一下测试号，接着ta的昵称和USER_ID就会出现在用户列表，返回回来的就是openid，在服务端由这个决定你需要推送的人。

![image-20221005182502234](https://cdn.jsdelivr.net/gh/shuyuncong/mdImg@c4686adbb8fe2e65932056907a615615e6c44f88/md/image2022/202210051825295.png)

生成推送模板，在{{}}中写参数，以.DATA结尾，模板内容可以自定义

![image-20221005182720733](https://cdn.jsdelivr.net/gh/shuyuncong/mdImg@c4686adbb8fe2e65932056907a615615e6c44f88/md/image2022/202210051827796.png)

拿到模板id，用户微信号id，就可以推送消息了。

```
{{riqi.DATA}}
{{beizhu.DATA}}
天气：{{tianqi.DATA}}
最低温度：{{low.DATA}} 度
最高温度：{{high.DATA}} 度
今天是我们恋爱的第 {{lianai.DATA}} 天
今天也是订婚的第 {{dinghun.DATA}} 天
我们已经成为合法夫妻 {{linzhen.DATA}} 天了
距离**的生日还有 {{mmshengri.DATA}} 天
距离**的生日还有 {{ccshengri.DATA}} 天
{{caihongpi.DATA}}
{{jinju.DATA}}
```

#### 服务端接口

源项目使用的springboot写的，我们直接套用了，

在pom.xml文件里引入下面类库。

```xml
<!--微信模版消息推送三方sdk-->
<dependency>
	<groupId>com.github.binarywang</groupId>
	<artifactId>weixin-java-mp</artifactId>
    <version>3.3.0</version>
</dependency>		
```

核心推送代码如下：

```java
public class Pusher {
    private static String appId = "xxxx";
    private static String secret = "xxx";
 
    public static void push(String openId,String templateId){
        //1，配置
        WxMpInMemoryConfigStorage wxStorage = new WxMpInMemoryConfigStorage();
        wxStorage.setAppId(appId);
        wxStorage.setSecret(secret);
        WxMpService wxMpService = new WxMpServiceImpl();
        wxMpService.setWxMpConfigStorage(wxStorage);
        //2,推送消息
        WxMpTemplateMessage templateMessage = WxMpTemplateMessage.builder()
                .toUser(openId)
                .templateId(templateId)
                .build();
        //3,如果是正式版发送模版消息，这里需要配置你的信息
        JSONObject todayWeather = Tianqi.getNanjiTianqi();
        templateMessage.addData(new WxMpTemplateData("riqi",todayWeather.getString("date") + "  "+ todayWeather.getString("week"),"#00BFFF"));
        templateMessage.addData(new WxMpTemplateData("tianqi",todayWeather.getString("text_day"),"#00FFFF"));
        templateMessage.addData(new WxMpTemplateData("low",todayWeather.getString("low") + "","#173177"));
        templateMessage.addData(new WxMpTemplateData("high",todayWeather.getString("high")+ "","#FF6347" ));
        templateMessage.addData(new WxMpTemplateData("caihongpi",CaiHongPi.getCaiHongPi(),"#FF69B4"));
        templateMessage.addData(new WxMpTemplateData("lianai",JiNianRi.getLianAi()+"","#FF1493"));
        templateMessage.addData(new WxMpTemplateData("shengri",JiNianRi.getShengRi()+"","#FFA500"));
        templateMessage.addData(new WxMpTemplateData("jinju",CaiHongPi.getJinJu()+"","#C71585"));
        //templateMessage.addData(new WxMpTemplateData("jiehun",JiNianRi.getJieHun()+""));
        templateMessage.addData(new WxMpTemplateData("linzhen",JiNianRi.getLinZhen()+"","#FF6347"));
        String beizhu = "情人节快乐！";
        if(JiNianRi.getJieHun() % 365 == 0){
            beizhu = "今天是结婚纪念日！";
        }
        if(JiNianRi.getLianAi() % 365 == 0){
            beizhu = "今天是恋爱纪念日！";
        }
        if(JiNianRi.getLinZhen() % 365 == 0){
            beizhu = "今天是结婚纪念日！";
        }
        templateMessage.addData(new WxMpTemplateData("beizhu",beizhu,"#FF0000"));
 
        try {
            System.out.println(templateMessage.toJson());
            System.out.println(wxMpService.getTemplateMsgService().sendTemplateMsg(templateMessage));
        } catch (Exception e) {
            System.out.println("推送失败：" + e.getMessage());
            e.printStackTrace();
        }
    }
}

```

#### 天气信息

这儿使用的是百度天气api，注册百度开发者，获取AK；

```
https://lbsyun.baidu.com/apiconsole/key#/home
```

![image-20221005184552564](https://cdn.jsdelivr.net/gh/shuyuncong/mdImg@c4686adbb8fe2e65932056907a615615e6c44f88/md/image2022/202210051845691.png)

![image-20221005184633563](https://cdn.jsdelivr.net/gh/shuyuncong/mdImg@c4686adbb8fe2e65932056907a615615e6c44f88/md/image2022/202210051846715.png)

![image-20221005184716057](https://cdn.jsdelivr.net/gh/shuyuncong/mdImg@c4686adbb8fe2e65932056907a615615e6c44f88/md/image2022/202210051847136.png)

提交后就能获得AK了。

```java
private static String ak = "刚刚申请的ak";//填写开放百度天气的API
private static String district_id = "#填写所在城市的区号";
public static JSONObject Weather() {
        String result = null;
        JSONObject today = new JSONObject();
        try {
            result = HttpUtil.get("https://api.map.baidu.com/weather/v1/?district_id=" + district_id + "&data_type=all&ak=" + ak);
            JSONObject jsonObject = JSONObject.parseObject(result);
            if (jsonObject.getString("message").equals("success")) {
                JSONArray arr = jsonObject.getJSONObject("result").getJSONArray("forecasts");
                today = arr.getJSONObject(0);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return today;
    }
```

#### 彩虹屁api

原博主使用的天行数据api，感觉略微麻烦，直接找了一个现成的接口 

```
https://api.shadiao.pro/chp 
```

相关代码：

```java
    private static String url = "https://api.shadiao.pro/chp";
    private static List<String> jinJuList = new ArrayList<>();
    public static String getCaiHongPi() {
        //默认彩虹屁
        String str = "阳光落在屋里，爱你藏在心里";
        try {
            JSONObject jsonObject = JSONObject.parseObject(HttpUtil.get(url));
            if(jsonObject.containsKey("data")){
                str  = jsonObject.getJSONObject("data").getString("text");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return str;
    }		
```

#### 每日金句

```java
 	/**
     * 载入金句库，若是接入接口，则不需要自己写模板
     */
    static {
        InputStream inputStream = Praise.class.getClassLoader().getResourceAsStream("jinju.txt");
        try (BufferedReader br = new BufferedReader(new InputStreamReader(inputStream))) {
            String str = "";
            String temp = "";
            while ((temp = br.readLine()) != null) {
                if (!StringUtils.isEmpty(temp)) {
                    str = str + "\r\n" + temp;
                } else {
                    jinJuList.add(str);
                    str = "";
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    public static String getJinJu() {
        Random random = new Random();
        return jinJuList.get(random.nextInt(jinJuList.size()));
    }
```

金句模板，简单粗暴：

![image-20221005185949851](https://cdn.jsdelivr.net/gh/shuyuncong/mdImg@c4686adbb8fe2e65932056907a615615e6c44f88/md/image2022/202210051859936.png)

#### 纪念日

```java
	/**
     * 距离date还有多少天
     * @param date
     * @return
     */
    public static int before(String date) {
        int day = 0;
        try {
            long time = simpleDateFormat.parse(date).getTime() - System.currentTimeMillis();
            day = (int) (time / 86400000L);
        } catch (ParseException e) {
            e.printStackTrace();
        }
        return day;
    }
```

#### 开启定时任务

启动类上加注解：@EnableScheduling

```java
  	// 每天早上6.20准时推送
  	@Scheduled(cron = "0 20 6 * * ?")
    public void goodMorning(){
        Pusher.push(openId,templateId);
    }
```

编写完成后可自行先测试一下，若收到测试号消息则表示成功，最后可自行部署在服务器上！没有服务器的，可以使用内网穿透工具，将本机服务启动端口映射到一个公网域名上。

### 免服务器版本

不会代码怎么办呢，这时候就得感谢微软给我们留下的好东西了，我们可以白嫖 Github Actions。首先这玩意之前也不知道可以这样用。

我们先fork一下rxrw大佬已经写好的基础版，

回到自己的仓库中，设置变量，把红色打圈的字符串按说明创建到 GitHub -> Settings -> Secrets -> Actions 中。

![image-20221005194019589](https://cdn.jsdelivr.net/gh/shuyuncong/mdImg@c4686adbb8fe2e65932056907a615615e6c44f88/md/image2022/202210051940851.png)

点击上图的3，创建行为变量。

![image-20221005193714683](https://cdn.jsdelivr.net/gh/shuyuncong/mdImg@c4686adbb8fe2e65932056907a615615e6c44f88/md/image2022/202210051937824.png)

重复以上操作，依次添加红圈中的行为变量，一个也不能少，格式也不能错。

启用自己项目下的 Action！

![30a5b1b2b06ba4a40a3d8ef01652409](https://cdn.jsdelivr.net/gh/shuyuncong/mdImg@c4686adbb8fe2e65932056907a615615e6c44f88/md/image2022/202210051932070.png)

如果运行出现错误，按以下方法可以看到错误，可以去大佬的 issue 提问。

![6b0da6f44e18c2bfd94910c377d13e6](https://cdn.jsdelivr.net/gh/shuyuncong/mdImg@c4686adbb8fe2e65932056907a615615e6c44f88/md/image2022/202210051932282.png)

启用后可以直接运行，看看女朋友的手机有没有收到推送吧！ 这个定时任务是每天早晨8点推送，如果会编程的同学可以自己自定义一些东西～

祝你好运！



参考链接：

- https://blog.csdn.net/m0_38130105/article/details/126160873
- https://github.com/13812851221/-rxrw-daily_morning