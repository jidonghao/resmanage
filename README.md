# 基于web的多媒体资源管理系统

## 项目介绍

这是一个基于Vue、uniapp、TypeScript、Express.js、Node.js 和 MySQL 的开源项目。它旨在实现一个基于web的多媒体资源管理系统。
[在线体验地址](https://res.dhxt.fun)  
[查看截图](https://github.com/jidonghao/resmanage/tree/master/document)  

## 技术栈

- **Front-end:** Vue, uniapp, TypeScript
- **Back-end:** Express.js, Node.js
- **Database:** MySQL

## 安装步骤

确保您的系统中已经安装了Node.js和MySQL。以下是安装该项目的步骤：

1. 克隆此仓库：
```
git clone https://github.com/jidonghao/resmanage
```

2. 根据resmanage-sql中的表结构与数据初始化MySQL数据库，并将 `resmanage-api/env.temp`拷贝并修改配置，重命名为.env.xx

3. 进入后端项目目录：
```
cd resmanage-api
```

4. 安装项目依赖：
```
npm install
```
或者
```
yarn install
```

5. 运行后端：
```
npm run dev
```

6. 进入前端项目目录：
```
cd resmanage-uniapp
```

7. 安装项目依赖：
```
npm install
```
或者
```
yarn install
```

8. 运行前端：
```
npm run dev:h5
```

## 项目目录结构

```
├──resmanage-admin            # 管理端（正在开发）
├──resmanage-api              # 后端
│   ├── logs                  # 日志
│   ├── public                # 静态页面存放位置
│   ├── routes                # 路由配置
│   ├── sms                   # 短信配置
│   ├── sql                   # sql语句
│   ├── .env.temp             # 环境变量模板
│   └── index.js              # 入口文件
├──resmanage-sql              # sql结构及数据
└──resmanage-uniapp           # 前端
    ├── src                
    │   ├── components        # 组件
    │   ├── image             # 图片
    │   ├── pages             # 页面
    │   ├── static            # 静态资源
    │   ├── style             # 样式
    │   └── utils             # 工具函数
```

## 贡献者指南

我们欢迎所有的贡献者。如果您有任何问题或建议，可以提交Issue或Pull Request。

## 许可证

本项目遵循MIT许可证。
