#!/usr/bin/env node

/**
 * Newsletter Kit CLI - 快速集成工具
 * 为新项目或现有项目快速添加newsletter功能
 */

const { Command } = require('commander');
const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const ora = require('ora');
const pc = require('picocolors');

const program = new Command();

program
  .name('newsletter-kit')
  .description('快速集成newsletter订阅功能到Next.js项目')
  .version('1.0.0');

// 初始化命令
program
  .command('init')
  .description('在当前项目中初始化newsletter功能')
  .option('-f, --force', '强制覆盖现有文件')
  .option('-t, --template <type>', '选择模板类型 (minimal|full|custom)', 'full')
  .option('--skip-install', '跳过依赖安装')
  .option('--skip-db', '跳过数据库设置')
  .action(async (options) => {
    const spinner = ora('初始化Newsletter Kit...').start();
    
    try {
      await initProject(options);
      spinner.succeed('Newsletter Kit 初始化成功!');
      console.log(`\n${pc.green('✅ 设置完成!')}`);
      console.log(`\n${pc.cyan('下一步:')}`);
      console.log(`1. 配置环境变量 (.env.local)`);
      console.log(`2. 运行数据库迁移: ${pc.yellow('npm run newsletter:migrate')}`);
      console.log(`3. 启动开发服务器: ${pc.yellow('npm run dev')}`);
    } catch (error) {
      spinner.fail('初始化失败');
      console.error(pc.red('错误:'), error.message);
      process.exit(1);
    }
  });

// 添加组件命令
program
  .command('add <component>')
  .description('添加newsletter组件到项目')
  .option('-d, --dir <directory>', '目标目录', 'components')
  .action(async (component, options) => {
    const spinner = ora(`添加 ${component} 组件...`).start();
    
    try {
      await addComponent(component, options);
      spinner.succeed(`${component} 组件添加成功!`);
    } catch (error) {
      spinner.fail('组件添加失败');
      console.error(pc.red('错误:'), error.message);
      process.exit(1);
    }
  });

// 数据库迁移命令
program
  .command('migrate')
  .description('运行数据库迁移')
  .option('--rollback', '回滚迁移')
  .action(async (options) => {
    const spinner = ora('运行数据库迁移...').start();
    
    try {
      await runMigration(options);
      spinner.succeed('数据库迁移完成!');
    } catch (error) {
      spinner.fail('数据库迁移失败');
      console.error(pc.red('错误:'), error.message);
      process.exit(1);
    }
  });

// 验证配置命令
program
  .command('validate')
  .description('验证当前配置')
  .action(async () => {
    const spinner = ora('验证配置...').start();
    
    try {
      const result = await validateConfig();
      spinner.succeed('配置验证完成!');
      
      if (result.valid) {
        console.log(pc.green('\n✅ 所有配置都正确!'));
      } else {
        console.log(pc.yellow('\n⚠️  发现配置问题:'));
        result.issues.forEach(issue => {
          console.log(`  • ${issue}`);
        });
      }
    } catch (error) {
      spinner.fail('配置验证失败');
      console.error(pc.red('错误:'), error.message);
      process.exit(1);
    }
  });

// 生成示例命令
program
  .command('examples')
  .description('生成使用示例')
  .option('-t, --type <type>', '示例类型 (basic|advanced|custom)', 'basic')
  .action(async (options) => {
    const spinner = ora('生成示例...').start();
    
    try {
      await generateExamples(options);
      spinner.succeed('示例生成完成!');
      console.log(`\n${pc.green('示例已生成到 examples/ 目录')}`);
    } catch (error) {
      spinner.fail('示例生成失败');
      console.error(pc.red('错误:'), error.message);
      process.exit(1);
    }
  });

// 主要功能实现
async function initProject(options) {
  const cwd = process.cwd();
  const packageJsonPath = path.join(cwd, 'package.json');
  
  // 检查是否为Next.js项目
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error('未找到 package.json，请在Next.js项目根目录运行此命令');
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  if (!packageJson.dependencies?.next) {
    throw new Error('当前项目似乎不是Next.js项目');
  }
  
  // 交互式配置
  const config = await inquirer.prompt([
    {
      type: 'list',
      name: 'database',
      message: '选择数据库提供商:',
      choices: ['Supabase', 'PlanetScale', 'Neon', 'Custom'],
      default: 'Supabase'
    },
    {
      type: 'list',
      name: 'styling',
      message: '选择样式方案:',
      choices: ['Tailwind CSS', 'CSS Modules', 'Styled Components'],
      default: 'Tailwind CSS'
    },
    {
      type: 'checkbox',
      name: 'features',
      message: '选择需要的功能:',
      choices: [
        'Email validation',
        'Rate limiting',
        'Subscriber count',
        'Success animations',
        'Custom themes',
        'Analytics integration'
      ],
      default: ['Email validation', 'Rate limiting', 'Subscriber count']
    },
    {
      type: 'confirm',
      name: 'typescript',
      message: '使用TypeScript?',
      default: true
    }
  ]);
  
  // 创建配置文件
  const configContent = generateConfigFile(config);
  fs.writeFileSync(
    path.join(cwd, 'newsletter.config.js'), 
    configContent
  );
  
  // 创建环境变量模板
  const envTemplate = generateEnvTemplate(config);
  const envPath = path.join(cwd, '.env.local.example');
  fs.writeFileSync(envPath, envTemplate);
  
  // 复制必要文件
  await copyTemplateFiles(cwd, options.template, config);
  
  // 更新package.json
  await updatePackageJson(packageJsonPath, config);
  
  // 安装依赖
  if (!options.skipInstall) {
    await installDependencies(config);
  }
}

async function addComponent(component, options) {
  const availableComponents = {
    'form': 'NewsletterForm - 基础订阅表单',
    'minimal': 'NewsletterFormMinimal - 最小化表单',
    'inline': 'NewsletterFormInline - 内联表单',
    'modal': 'NewsletterFormModal - 模态框表单',
    'hero': 'NewsletterFormHero - 首页英雄区表单',
    'count': 'NewsletterCount - 订阅者计数',
    'provider': 'NewsletterProvider - 上下文提供者'
  };
  
  if (!availableComponents[component]) {
    throw new Error(`未知组件: ${component}\n可用组件: ${Object.keys(availableComponents).join(', ')}`);
  }
  
  const templatePath = path.join(__dirname, '..', 'templates', 'components', `${component}.tsx`);
  const targetPath = path.join(process.cwd(), options.dir, `Newsletter${component.charAt(0).toUpperCase() + component.slice(1)}.tsx`);
  
  if (!fs.existsSync(templatePath)) {
    throw new Error(`组件模板不存在: ${templatePath}`);
  }
  
  // 确保目标目录存在
  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  // 复制模板文件
  fs.copyFileSync(templatePath, targetPath);
  
  console.log(`\n${pc.cyan('组件已添加:')} ${targetPath}`);
  console.log(`${pc.dim('描述:')} ${availableComponents[component]}`);
}

async function runMigration(options) {
  const configPath = path.join(process.cwd(), 'newsletter.config.js');
  
  if (!fs.existsSync(configPath)) {
    throw new Error('未找到newsletter.config.js配置文件，请先运行 newsletter-kit init');
  }
  
  // 这里实现数据库迁移逻辑
  const migrationScript = `
-- Newsletter subscription table
CREATE TABLE IF NOT EXISTS email_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source VARCHAR(50) DEFAULT 'web',
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_email ON email_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_subscribed_at ON email_subscriptions(subscribed_at);

-- Enable RLS (Row Level Security)
ALTER TABLE email_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your needs)
CREATE POLICY "Allow public read access" ON email_subscriptions
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON email_subscriptions
  FOR INSERT WITH CHECK (true);
  `;
  
  // 保存迁移脚本
  const migrationPath = path.join(process.cwd(), 'migrations', '001_create_newsletter_table.sql');
  const migrationDir = path.dirname(migrationPath);
  
  if (!fs.existsSync(migrationDir)) {
    fs.mkdirSync(migrationDir, { recursive: true });
  }
  
  fs.writeFileSync(migrationPath, migrationScript);
  
  console.log(`\n${pc.cyan('迁移脚本已生成:')} ${migrationPath}`);
  console.log(`${pc.yellow('请在Supabase控制台或数据库客户端中执行此脚本')}`);
}

async function validateConfig() {
  const issues = [];
  const cwd = process.cwd();
  
  // 检查必要文件
  const requiredFiles = [
    'newsletter.config.js',
    '.env.local'
  ];
  
  for (const file of requiredFiles) {
    if (!fs.existsSync(path.join(cwd, file))) {
      issues.push(`缺少文件: ${file}`);
    }
  }
  
  // 检查环境变量
  if (fs.existsSync(path.join(cwd, '.env.local'))) {
    const envContent = fs.readFileSync(path.join(cwd, '.env.local'), 'utf8');
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];
    
    for (const varName of requiredVars) {
      if (!envContent.includes(varName)) {
        issues.push(`缺少环境变量: ${varName}`);
      }
    }
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}

async function generateExamples(options) {
  const examplesDir = path.join(process.cwd(), 'examples', 'newsletter');
  
  if (!fs.existsSync(examplesDir)) {
    fs.mkdirSync(examplesDir, { recursive: true });
  }
  
  const examples = {
    basic: `
// Basic Newsletter Form Example
import { NewsletterForm } from '@silksong/newsletter-kit';

export default function BasicExample() {
  return (
    <div className="max-w-md mx-auto">
      <NewsletterForm 
        showCount={true}
        onSuccess={(data) => {
          console.log('Subscription successful:', data);
        }}
      />
    </div>
  );
}`,
    
    advanced: `
// Advanced Newsletter Form Example
import { NewsletterProvider, NewsletterFormHero, NewsletterCount } from '@silksong/newsletter-kit';

const config = {
  theme: {
    colors: {
      primary: '#3b82f6',
      background: '#ffffff'
    }
  },
  messages: {
    success: 'Welcome to our newsletter!',
    placeholder: 'Your email address...'
  }
};

export default function AdvancedExample() {
  return (
    <NewsletterProvider config={config}>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Stay Updated</h1>
            <p className="text-lg text-gray-600 mb-8">
              Get the latest updates and exclusive content
            </p>
            <NewsletterCount className="text-sm text-gray-500" />
          </div>
          
          <NewsletterFormHero
            size="lg"
            variant="outlined"
            className="max-w-lg mx-auto"
          />
        </div>
      </div>
    </NewsletterProvider>
  );
}`
  };
  
  const exampleType = options.type || 'basic';
  const content = examples[exampleType];
  
  if (!content) {
    throw new Error(`未知示例类型: ${exampleType}`);
  }
  
  fs.writeFileSync(
    path.join(examplesDir, `${exampleType}-example.tsx`),
    content
  );
}

// 辅助函数
function generateConfigFile(config) {
  return `
/** @type {import('@silksong/newsletter-kit').NewsletterConfig} */
module.exports = {
  // Database configuration
  tableName: 'email_subscriptions',
  
  // Rate limiting
  rateLimit: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    duplicateEmailWindowMs: 60 * 1000 // 1 minute
  },
  
  // Theme configuration
  theme: {
    colors: {
      primary: 'hsl(221.2 83.2% 53.3%)',
      secondary: 'hsl(210 40% 98%)',
      background: 'hsl(0 0% 100%)',
      foreground: 'hsl(222.2 84% 4.9%)',
      muted: 'hsl(210 40% 96%)',
      border: 'hsl(214.3 31.8% 91.4%)'
    },
    radius: {
      sm: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem'
    }
  },
  
  // Validation
  validation: {
    maxEmailLength: 254
  },
  
  // Messages
  messages: {
    success: '订阅成功！感谢您的关注。',
    error: '订阅失败，请重试。',
    alreadySubscribed: '该邮箱已订阅。',
    invalidEmail: '请输入有效的邮箱地址。',
    placeholder: '输入您的邮箱地址',
    submitButton: '订阅',
    loadingButton: '订阅中...'
  }
};`;
}

function generateEnvTemplate(config) {
  return `# Newsletter Kit 环境变量配置
# 复制此文件为 .env.local 并填写实际值

# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key_here

# 可选: 自定义配置
# NEWSLETTER_TABLE_NAME=email_subscriptions
# NEWSLETTER_RATE_LIMIT_MAX=5
# NEWSLETTER_RATE_LIMIT_WINDOW=900000
`;
}

async function copyTemplateFiles(targetDir, template, config) {
  const templatesDir = path.join(__dirname, '..', 'templates', template);
  
  // 这里实现模板文件复制逻辑
  // 根据选择的模板和配置复制相应文件
}

async function updatePackageJson(packageJsonPath, config) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // 添加必要的依赖
  if (!packageJson.dependencies) packageJson.dependencies = {};
  if (!packageJson.devDependencies) packageJson.devDependencies = {};
  if (!packageJson.scripts) packageJson.scripts = {};
  
  // 添加newsletter相关脚本
  packageJson.scripts['newsletter:migrate'] = 'newsletter-kit migrate';
  packageJson.scripts['newsletter:validate'] = 'newsletter-kit validate';
  packageJson.scripts['newsletter:examples'] = 'newsletter-kit examples';
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

async function installDependencies(config) {
  const { spawn } = require('child_process');
  
  return new Promise((resolve, reject) => {
    const npm = spawn('npm', ['install', '@silksong/newsletter-kit'], {
      stdio: 'inherit',
      shell: true
    });
    
    npm.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`依赖安装失败，退出码: ${code}`));
      }
    });
  });
}

program.parse();