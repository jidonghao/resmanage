/*
 Navicat Premium Data Transfer

 Source Server         : localhost
 Source Server Type    : MySQL
 Source Server Version : 50740 (5.7.40)
 Source Host           : localhost:3306
 Source Schema         : resmanage

 Target Server Type    : MySQL
 Target Server Version : 50740 (5.7.40)
 File Encoding         : 65001

 Date: 07/02/2023 17:40:15
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for res_file
-- ----------------------------
DROP TABLE IF EXISTS `res_file`;
CREATE TABLE `res_file`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL COMMENT '所属用户id',
  `type` tinyint(2) NOT NULL COMMENT '1：folder,2：img,3：video',
  `type_detail` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '详细文件扩展信息例如zip,jpeg,..',
  `folder_id` int(11) NOT NULL DEFAULT -1 COMMENT '文件所属目录id',
  `file_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '用户定义文件名，默认上传的文件名',
  `file_path` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '资源所在地址',
  `label_id` int(11) NOT NULL DEFAULT -1 COMMENT '文件绑定标签id',
  `add_time` datetime NOT NULL COMMENT '资源添加时间',
  `update_time` datetime NULL DEFAULT NULL COMMENT '资源更新时间',
  `query_time` datetime NULL DEFAULT NULL COMMENT '查看时间',
  `deleted` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否被删除',
  PRIMARY KEY (`id`, `user_id`, `folder_id`, `label_id`, `type`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 28 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of res_file
-- ----------------------------
INSERT INTO `res_file` VALUES (1, 1, 1, NULL, -1, '测试', NULL, -1, '2023-01-22 20:01:01', '2023-01-22 20:01:03', '2023-01-22 20:01:07', 0);
INSERT INTO `res_file` VALUES (2, 1, 1, NULL, -1, 'test', NULL, -1, '2023-01-22 20:01:57', '2023-01-22 20:02:00', '2023-01-22 20:02:02', 0);
INSERT INTO `res_file` VALUES (3, 1, 1, NULL, -1, '测试2', NULL, -1, '2023-01-22 20:22:50', '2023-01-22 20:22:50', NULL, 0);
INSERT INTO `res_file` VALUES (4, 1, 1, NULL, -1, '测试2', NULL, -1, '2023-01-22 20:23:07', '2023-01-22 20:23:07', NULL, 0);
INSERT INTO `res_file` VALUES (5, 1, 1, NULL, -1, '测试2', NULL, -1, '2023-01-22 20:23:07', '2023-01-22 20:23:07', NULL, 0);
INSERT INTO `res_file` VALUES (6, 1, 1, NULL, -1, '测试2', NULL, -1, '2023-01-22 20:23:08', '2023-01-22 20:23:08', NULL, 0);
INSERT INTO `res_file` VALUES (7, 1, 1, NULL, -1, '测试2', NULL, -1, '2023-01-22 20:23:08', '2023-01-22 20:23:08', NULL, 0);
INSERT INTO `res_file` VALUES (8, 1, 1, NULL, -1, '测试2', NULL, -1, '2023-01-22 20:23:08', '2023-01-22 20:23:08', NULL, 0);
INSERT INTO `res_file` VALUES (9, 1, 1, NULL, -1, '测试2', NULL, -1, '2023-01-22 20:23:08', '2023-01-22 20:23:08', NULL, 0);
INSERT INTO `res_file` VALUES (10, 1, 1, NULL, -1, '测试2', NULL, -1, '2023-01-22 20:23:08', '2023-01-22 20:23:08', NULL, 0);
INSERT INTO `res_file` VALUES (11, 1, 1, NULL, -1, '测试2', NULL, -1, '2023-01-22 20:23:09', '2023-01-22 20:23:09', NULL, 0);
INSERT INTO `res_file` VALUES (12, 1, 1, NULL, -1, '测试2', NULL, -1, '2023-01-22 20:23:09', '2023-01-22 20:23:09', NULL, 0);
INSERT INTO `res_file` VALUES (13, 1, 1, NULL, -1, '测试2', NULL, -1, '2023-01-22 20:23:09', '2023-01-22 20:23:09', NULL, 0);
INSERT INTO `res_file` VALUES (14, 1, 1, NULL, -1, '测试2', NULL, -1, '2023-01-22 20:23:09', '2023-01-22 20:23:09', NULL, 0);
INSERT INTO `res_file` VALUES (15, 1, 1, NULL, -1, '测试2', NULL, -1, '2023-01-22 20:23:09', '2023-01-22 20:23:09', NULL, 0);
INSERT INTO `res_file` VALUES (16, 1, 1, NULL, -1, '测试2', NULL, -1, '2023-01-22 20:23:09', '2023-01-22 20:23:09', NULL, 0);
INSERT INTO `res_file` VALUES (17, 1, 1, NULL, -1, '测试2', NULL, -1, '2023-01-22 20:23:09', '2023-01-22 20:23:09', NULL, 0);
INSERT INTO `res_file` VALUES (18, 1, 1, NULL, -1, '测试2', NULL, -1, '2023-01-22 20:23:09', '2023-01-22 20:23:09', NULL, 0);
INSERT INTO `res_file` VALUES (19, 1, 1, NULL, -1, '测试2', NULL, -1, '2023-01-22 20:23:10', '2023-01-22 20:23:10', NULL, 0);
INSERT INTO `res_file` VALUES (20, 1, 1, NULL, -1, '测试2', NULL, -1, '2023-01-22 20:23:10', '2023-01-22 20:23:10', NULL, 0);
INSERT INTO `res_file` VALUES (21, 1, 1, NULL, -1, '测试2', NULL, -1, '2023-01-22 20:23:10', '2023-01-22 20:23:10', NULL, 0);
INSERT INTO `res_file` VALUES (22, 1, 1, NULL, -1, '测试2', NULL, -1, '2023-01-22 20:23:10', '2023-01-22 20:23:10', NULL, 0);
INSERT INTO `res_file` VALUES (23, 1, 1, NULL, -1, '测试2', NULL, -1, '2023-01-22 20:23:10', '2023-01-22 20:23:10', NULL, 0);
INSERT INTO `res_file` VALUES (24, 1, 1, NULL, -1, '测试2', NULL, -1, '2023-01-22 20:23:10', '2023-01-22 20:23:10', NULL, 0);
INSERT INTO `res_file` VALUES (25, 1, 1, NULL, -1, '测试2', NULL, -1, '2023-01-22 20:23:11', '2023-01-22 20:23:11', NULL, 0);
INSERT INTO `res_file` VALUES (26, 1, 1, NULL, -1, '测试2', NULL, -1, '2023-01-22 20:23:11', '2023-01-22 20:23:11', NULL, 0);
INSERT INTO `res_file` VALUES (27, 1, 1, NULL, -1, '测试2', NULL, -1, '2023-01-24 16:16:21', '2023-01-24 16:16:21', NULL, 0);

-- ----------------------------
-- Table structure for res_folder
-- ----------------------------
DROP TABLE IF EXISTS `res_folder`;
CREATE TABLE `res_folder`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL COMMENT '绑定用户id',
  `folder_id` int(11) NULL DEFAULT NULL COMMENT '所在目录id',
  `folder_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `update_time` datetime NULL DEFAULT NULL COMMENT '修改时间',
  `add_time` datetime NULL DEFAULT NULL COMMENT '添加时间',
  `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否被删除',
  PRIMARY KEY (`id`, `user_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 12 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of res_folder
-- ----------------------------
INSERT INTO `res_folder` VALUES (1, 1, NULL, '测试', '2023-01-20 14:23:03', '2023-01-20 14:10:57', 0);
INSERT INTO `res_folder` VALUES (2, 1, NULL, '测试2', '2023-01-20 14:23:05', '2023-01-20 14:20:25', 0);
INSERT INTO `res_folder` VALUES (7, 1, NULL, '123', '2023-01-20 14:23:05', '2023-01-20 14:23:05', 0);
INSERT INTO `res_folder` VALUES (8, 1, NULL, '测试2', '2023-01-20 14:34:03', '2023-01-20 14:34:03', 0);
INSERT INTO `res_folder` VALUES (9, 1, NULL, '测试2', '2023-01-20 14:34:17', '2023-01-20 14:34:17', 0);
INSERT INTO `res_folder` VALUES (10, 1, NULL, '测试2', '2023-01-20 14:35:20', '2023-01-20 14:35:20', 0);
INSERT INTO `res_folder` VALUES (11, 1, NULL, '测试2', '2023-01-20 14:35:30', '2023-01-20 14:35:30', 0);

-- ----------------------------
-- Table structure for res_label
-- ----------------------------
DROP TABLE IF EXISTS `res_label`;
CREATE TABLE `res_label`  (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL COMMENT '所属用户id',
  `label_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '标签名',
  `add_time` datetime NULL DEFAULT NULL COMMENT '添加时间',
  `update_time` datetime NULL DEFAULT NULL COMMENT '更新时间',
  `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否被删除',
  PRIMARY KEY (`id`, `user_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of res_label
-- ----------------------------

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`  (
  `id` int(64) NOT NULL AUTO_INCREMENT,
  `nick_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `passwd` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `identity` tinyint(1) NOT NULL DEFAULT 1 COMMENT '身份9超级管理员 具体代码限制',
  `phone_number` varchar(22) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `avatar` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT 'https://oss.dhxt.fun/avatar_rabbit.png',
  `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否被删除',
  `create_time` datetime NULL DEFAULT NULL COMMENT '用户创建时间',
  `update_time` datetime NULL DEFAULT NULL COMMENT '用户信息更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES (1, '用户123212', '12345678', 9, '16688171257', 'https://oss.dhxt.fun/avatar_rabbit.png', 0, '2023-02-07 12:48:17', '2023-02-07 12:48:23');
INSERT INTO `user` VALUES (2, 'liuming', '12345678', 9, '15512345678', 'https://oss.dhxt.fun/avatar_rabbit.png', 0, '2023-02-07 12:48:20', '2023-02-07 12:48:27');
INSERT INTO `user` VALUES (3, '测试', NULL, 1, '13247362734', 'https://oss.dhxt.fun/avatar_rabbit.png', 0, '2020-01-01 00:00:00', '2020-01-01 00:00:00');
INSERT INTO `user` VALUES (4, '用户_7525979', NULL, 1, '16688171257', 'https://oss.dhxt.fun/avatar_rabbit.png', 0, '2023-02-07 13:02:53', '2023-02-07 13:02:53');

SET FOREIGN_KEY_CHECKS = 1;
