import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class WxPayService {
  private readonly logger = new Logger(WxPayService.name);
  private readonly appId: string;
  private readonly mchId: string;
  private readonly apiKey: string;
  private readonly notifyUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.appId = this.configService.get('WX_APP_ID') || '';
    this.mchId = this.configService.get('WX_MCH_ID') || '';
    this.apiKey = this.configService.get('WX_API_KEY') || '';
    this.notifyUrl = this.configService.get('WX_NOTIFY_URL') || '';
  }

  /**
   * 创建微信支付订单
   */
  async createPayment(params: {
    outTradeNo: string;
    description: string;
    amount: number;
    openid: string;
  }) {
    try {
      const { outTradeNo, description, amount, openid } = params;

      // 构建请求参数
      const paymentParams = {
        appid: this.appId,
        mch_id: this.mchId,
        nonce_str: this.generateNonceStr(),
        body: description,
        out_trade_no: outTradeNo,
        total_fee: amount,
        spbill_create_ip: '127.0.0.1',
        notify_url: this.notifyUrl,
        trade_type: 'JSAPI',
        openid: openid,
      };

      // 生成签名
      const sign = this.generateSign(paymentParams);
      paymentParams['sign'] = sign;

      // 转换为XML
      const xml = this.objectToXml(paymentParams);

      // 调用微信API
      const response = await axios.post(
        'https://api.mch.weixin.qq.com/pay/unifiedorder',
        xml,
        {
          headers: { 'Content-Type': 'application/xml' },
        },
      );

      // 解析响应
      const result = this.xmlToObject(response.data);

      if (
        result.return_code !== 'SUCCESS' ||
        result.result_code !== 'SUCCESS'
      ) {
        throw new Error(
          `微信支付下单失败: ${result.return_msg || result.err_code_des}`,
        );
      }

      // 生成小程序支付参数
      const paySign = this.generatePaySign({
        appId: this.appId,
        timeStamp: Math.floor(Date.now() / 1000).toString(),
        nonceStr: this.generateNonceStr(),
        package: `prepay_id=${result.prepay_id}`,
        signType: 'MD5',
      });

      return {
        prepay_id: result.prepay_id,
        paySign,
        timeStamp: Math.floor(Date.now() / 1000).toString(),
        nonceStr: this.generateNonceStr(),
        signType: 'MD5',
      };
    } catch (error) {
      this.logger.error(`创建微信支付订单失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 验证回调签名
   * @param body - 微信支付回调的原始请求体
   * @param headers - 微信支付回调的HTTP头部信息
   */
  verifySignature(
    body: Buffer,
    headers: Record<string, string>,
  ): Promise<boolean> {
    try {
      // 这里应该根据微信支付V3的签名验证逻辑实现
      // 暂时返回true，实际项目中需要完整实现
      // TODO: 使用 body 和 headers 实现真实的签名验证
      this.logger.debug(
        `验证签名 - Body长度: ${body.length}, Headers: ${Object.keys(headers).length}`,
      );
      return Promise.resolve(true);
    } catch (error) {
      this.logger.error(`验证签名失败: ${error.message}`, error.stack);
      return Promise.resolve(false);
    }
  }

  /**
   * 解析回调数据
   */
  parseNotifyData(body: Buffer): Promise<any> {
    try {
      const xmlData = body.toString();
      return Promise.resolve(this.xmlToObject(xmlData));
    } catch (error) {
      this.logger.error(`解析回调数据失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 申请退款
   */
  async refund(params: {
    outTradeNo: string;
    outRefundNo: string;
    totalFee: number;
    refundFee: number;
    refundDesc?: string;
  }) {
    try {
      // 构建退款参数
      const refundParams = {
        appid: this.appId,
        mch_id: this.mchId,
        nonce_str: this.generateNonceStr(),
        out_trade_no: params.outTradeNo,
        out_refund_no: params.outRefundNo,
        total_fee: params.totalFee,
        refund_fee: params.refundFee,
        refund_desc: params.refundDesc || '退款',
      };

      // 生成签名
      const sign = this.generateSign(refundParams);
      refundParams['sign'] = sign;

      // 转换为XML
      const xml = this.objectToXml(refundParams);

      // 调用微信退款API（需要证书）
      const response = await axios.post(
        'https://api.mch.weixin.qq.com/secapi/pay/refund',
        xml,
        {
          headers: { 'Content-Type': 'application/xml' },
          // 这里需要配置客户端证书
        },
      );

      // 解析响应
      const result = this.xmlToObject(response.data);

      if (
        result.return_code !== 'SUCCESS' ||
        result.result_code !== 'SUCCESS'
      ) {
        throw new Error(
          `微信退款失败: ${result.return_msg || result.err_code_des}`,
        );
      }

      return result;
    } catch (error) {
      this.logger.error(`微信退款失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  // 私有辅助方法

  private generateNonceStr(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private generateSign(params: Record<string, any>): string {
    // 过滤空值并排序
    const filteredParams = Object.keys(params)
      .filter((key) => params[key] !== undefined && params[key] !== '')
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {});

    // 构建签名字符串
    const stringA = Object.keys(filteredParams)
      .map((key) => `${key}=${filteredParams[key]}`)
      .join('&');

    const stringSignTemp = `${stringA}&key=${this.apiKey}`;

    // MD5签名
    return crypto
      .createHash('md5')
      .update(stringSignTemp)
      .digest('hex')
      .toUpperCase();
  }

  private generatePaySign(params: Record<string, string>): string {
    // 构建签名字符串
    const stringA = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join('&');

    const stringSignTemp = `${stringA}&key=${this.apiKey}`;

    // MD5签名
    return crypto
      .createHash('md5')
      .update(stringSignTemp)
      .digest('hex')
      .toUpperCase();
  }

  private objectToXml(obj: Record<string, any>): string {
    let xml = '<xml>';
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        xml += `<${key}>${obj[key]}</${key}>`;
      }
    }
    xml += '</xml>';
    return xml;
  }

  private xmlToObject(xml: string): Record<string, any> {
    const result = {};
    const regex = /<(\w+)>([^<]*)<\/\1>/g;
    let match;

    while ((match = regex.exec(xml)) !== null) {
      result[match[1]] = match[2];
    }

    return result;
  }
}
