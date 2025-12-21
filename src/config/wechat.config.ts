import { registerAs } from '@nestjs/config';

/**
 * 微信登录配置
 */
export default registerAs('wechat', () => ({
  /**
   * 微信小程序/公众号AppID
   */
  appId: process.env.WECHAT_APP_ID || '',
  /**
   * 微信小程序/公众号AppSecret
   */
  appSecret: process.env.WECHAT_APP_SECRET || '',
  /**
   * 微信登录授权URL
   */
  authUrl: 'https://api.weixin.qq.com/sns/jscode2session',
  /**
   * 微信用户信息获取URL
   */
  userInfoUrl: 'https://api.weixin.qq.com/sns/userinfo',
}));
