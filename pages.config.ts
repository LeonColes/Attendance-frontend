/*
 * @Author: weisheng
 * @Date: 2024-11-01 11:44:38
 * @LastEditTime: 2025-01-13 17:00:24
 * @LastEditors: 810505339
 * @Description:
 * @FilePath: \wot-demo\pages.config.ts
 * 记得注释
 */
import { defineUniPages } from '@uni-helper/vite-plugin-uni-pages'

export default defineUniPages({
  pages: [],
  globalStyle: {
    navigationBarTitleText: 'Wot-Demo',
    navigationBarTextStyle: 'white',
    navigationStyle: 'custom',
  },
  tabBar: {
    custom: true,
    height: '0',
    color: '#bfbfbf',
    selectedColor: '#0165FF',
    list: [{
      pagePath: 'pages/index',
    }, {
      pagePath: 'pages/my/index',
    }],
  },
})
