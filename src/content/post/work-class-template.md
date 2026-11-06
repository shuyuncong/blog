---
title: "IDEA 设置类注释模板作者、日期、描述等信息"
description: "IDEA 设置类注释模板作者、日期、描述等信息。每次换电脑或者新同事入职都要统一修改，找了网上好多教程都写的乱七八糟的啥都有，为方便统一就自己写一个操作方法，方便大家的开发配置，同时也为自己以后配置留一份记录"
publishDate: "2024-08-03"
tags: ["工作", "工具", "IDEA"]
---




IDEA 作为越来越多程序员使用的开发工具，平时的代码注释也非常的关键，类上注释和方法上注释。每次换电脑或者新同事入职都要统一修改，找了网上好多教程都写的乱七八糟的啥都有，为方便统一就自己写一个操作方法，方便大家的开发配置，同时也为自己以后配置留一份记录（毕竟每次换环境都需要重新配置一遍）

## 类注释

打开设置

- File >> Settings , 打开设置窗口输入Templates
- 找到File and Code Templates 模板配置
- 选择右侧的 Files 选项卡，选择位置 Class
- 在最右侧的输入栏中，输入位置框住的一段注释代码，然后点击保存即可
- 将以下代码Author改为你的信息

```java
/**
 * 
 * @author: shuyuncong
 * @date: ${DATE}
 * @description:
 * @modify:
 */
```


模版配置示例如下:

![image-20240803201845675](https://cdn.jsdelivr.net/gh/shuyuncong0/mdImg/md/image2024/202408032018796.png)


设置好后每次创建class文件会弹两次窗口，一次是文件命名，一次是类描述

实际生成效果：

![image-20240803202012976](https://cdn.jsdelivr.net/gh/shuyuncong0/mdImg/md/image2024/202408032020024.png)

## 方法模板

IDEA 可以很简单的自定义类的注释模板，但是对于自定义方法注释模板并不是那么的友好。在网上查看了很多方法注释模板，但大多数生成的效果都不理想。本文实现了在方法外通过/**注释的模板。

### 实现方法

1、File >> Setting >> Editor >> LiveTemplates >> 右上角+号 >> 组命名 

2、再次点击右上角+号在该组中新建自定义方法注释

![image-20240803202932520](https://cdn.jsdelivr.net/gh/shuyuncong0/mdImg/md/image2024/202408032029594.png)

新建Template Group，名字可以随便取， 我这里就叫MyGroup，然后创建Live Template
　
配置的内容：

- Abbreviation：模板的缩写，可以是【/】【/**】【】等，看个人习惯了，主要是生成注释的快捷提示符，后面会说怎么用。
- Description：模板的描述，方便自己以后查找，比如写：方法注释。
- Template text：模板的内容，参数名用$ 参数名 $ 格式。
- Options→Expand with：模板的扩展快捷键，可以按照个人习惯选择，有人喜欢用【Tab】键我用的是【Enter】键，后面会介绍用法。

配置模板格式，格式如下所示，

```
*
 * @author: shuyuncong
 * @date: $date$ $param$ 
 * @return: $return$
 * @description: TODO
 * @modify: 
 */
```

请按照下图说标序号顺序进行配置，

![image-20240803203543489](https://cdn.jsdelivr.net/gh/shuyuncong0/mdImg/md/image2024/202408032035574.png)



### 设置变量参数

点击图中的 Edit variables，列表中显示的就是刚刚配置的模板的参数 `$参数名$`，在 `Expression` 中下拉选择方法为其赋值；对于 `$params$` 参数需要注意，IDEA 给我们默认的是`methodParameters()` 方法，这个方法是把形参显示在一行，我们需要的是一行一个参数这样显示，可以通过自定义脚本实现，把下面的脚本复制到 Expression 中即可。
**params**

```groovy
groovyScript("if(\"${_1}\".length() == 2) {return '';} else {def result=''; def params=\"${_1}\".replaceAll('[\\\\[|\\\\]|\\\\s]', '').split(',').toList();for(i = 0; i < params.size(); i++) {result+='\\n' + ' * @param: ' + params[i] + ' '}; return result;}", methodParameters());
```

**return**

```groovy
groovyScript("def result=\"${_1}\"; if(result == \"void\"){return \"\";}else{return \"{@link \"+result+\"}\";}", methodReturnType())
```


6、设置应用场景

我主要写Java，那就在这里勾选Java类型就好了。

![image-20240803204007112](https://cdn.jsdelivr.net/gh/shuyuncong0/mdImg/md/image2024/202408032040181.png)

### 测试效果

点击OK就可以完成配置，以上就配置完成。使用的时候，先创建一个方法，然后在方法外上一行中输入 /** 点击 Enter 键，就自动生成了对应的注释，最终效果如下：

![image-20240803204124547](https://cdn.jsdelivr.net/gh/shuyuncong0/mdImg/md/image2024/202408032041617.png)

**生成注释后报Wrong tag 'Description’解决方法**
将自己定义的标签加入到这里就好了，不过手动点击黄色的tag，idea也会自动机加入到这里，我添加到这里的标签如下：

```
Description:,Version:,CreateTime:,Auther:,param,param:,description:,date:,
```

![1722688938524](https://cdn.jsdelivr.net/gh/shuyuncong0/mdImg/md/image2024/202408032042862.jpg)



祝你好运！