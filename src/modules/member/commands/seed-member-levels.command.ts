import { Command, CommandRunner } from 'nest-commander';
import { MemberLevelSeed } from '../seed/member-level.seed';

/**
 * 会员等级种子数据命令
 * 用于执行会员等级数据的初始化
 */
@Command({
  name: 'seed:member-levels',
  description: '初始化会员等级数据',
})
export class SeedMemberLevelsCommand extends CommandRunner {
  constructor(private readonly memberLevelSeed: MemberLevelSeed) {
    super();
  }

  /**
   * 执行命令
   * @param args 命令参数
   * @param options 命令选项
   */
  async run(): Promise<void> {
    try {
      await this.memberLevelSeed.seed();
      console.log('会员等级数据初始化成功');
    } catch (error) {
      console.error('会员等级数据初始化失败:', error.message);
      process.exit(1);
    }
  }
}
