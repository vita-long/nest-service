import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMethod } from '@/entities/payment-method.entity';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(PaymentMethod) 
    private paymentMethodRepository: Repository<PaymentMethod>
  ) {}

  /**
   * 生成8位数字支付方式编码
   */
  private async generateCode(): Promise<string> {
    let code: string = '';
    let isUnique: boolean = false;

    // 生成8位随机数字，确保唯一
    while (!isUnique) {
      code = Math.floor(10000000 + Math.random() * 90000000).toString();
      
      // 检查编码是否已存在
      const existing = await this.paymentMethodRepository.findOneBy({ code });
      isUnique = !existing;
    }

    return code;
  }

  /**
   * 创建支付方式
   */
  async create(createPaymentMethodDto: CreatePaymentMethodDto): Promise<PaymentMethod> {
    const code = await this.generateCode();

    const paymentMethod = this.paymentMethodRepository.create({
      ...createPaymentMethodDto,
      code,
    });
    return this.paymentMethodRepository.save(paymentMethod);
  }

  /**
   * 获取所有支付方式
   */
  async findAll(): Promise<PaymentMethod[]> {
    return this.paymentMethodRepository.find({
      order: { sortOrder: 'ASC' }
    });
  }

  /**
   * 获取启用的支付方式
   */
  async findEnabled(): Promise<PaymentMethod[]> {
    return this.paymentMethodRepository.find({
      where: { isEnabled: true },
      order: { sortOrder: 'ASC' }
    });
  }

  /**
   * 根据ID获取支付方式
   */
  async findById(id: number): Promise<PaymentMethod> {
    const paymentMethod = await this.paymentMethodRepository.findOneBy({ id });
    
    if (!paymentMethod) {
      throw new NotFoundException(`支付方式ID ${id} 不存在`);
    }
    
    return paymentMethod;
  }

  /**
   * 根据代码获取支付方式
   */
  async findByCode(code: string): Promise<PaymentMethod> {
    const paymentMethod = await this.paymentMethodRepository.findOneBy({ code });
    
    if (!paymentMethod) {
      throw new NotFoundException(`支付方式代码 ${code} 不存在`);
    }
    
    return paymentMethod;
  }

  /**
   * 更新支付方式
   */
  async update(id: number, updatePaymentMethodDto: UpdatePaymentMethodDto): Promise<PaymentMethod> {
    // 检查支付方式是否存在
    const paymentMethod = await this.findById(id);

    // 如果更新代码，检查新代码是否已存在
    if (updatePaymentMethodDto.code && updatePaymentMethodDto.code !== paymentMethod.code) {
      const existingPaymentMethod = await this.paymentMethodRepository.findOneBy({ 
        code: updatePaymentMethodDto.code 
      });
      
      if (existingPaymentMethod) {
        throw new BadRequestException(`支付方式代码 ${updatePaymentMethodDto.code} 已存在`);
      }
    }

    // 更新支付方式
    Object.assign(paymentMethod, updatePaymentMethodDto);
    return this.paymentMethodRepository.save(paymentMethod);
  }

  /**
   * 启用/禁用支付方式
   */
  async toggleStatus(id: number, isEnabled: boolean): Promise<PaymentMethod> {
    // 检查支付方式是否存在
    const paymentMethod = await this.findById(id);
    
    // 更新状态
    paymentMethod.isEnabled = isEnabled;
    return this.paymentMethodRepository.save(paymentMethod);
  }

  /**
   * 删除支付方式
   */
  async remove(id: number): Promise<void> {
    // 检查支付方式是否存在
    await this.findById(id);
    
    const result = await this.paymentMethodRepository.delete({ id });
    
    if (result.affected === 0) {
      throw new NotFoundException(`删除支付方式失败，ID ${id} 不存在`);
    }
  }
}
