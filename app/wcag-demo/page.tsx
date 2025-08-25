/**
 * WCAG 无障碍标准演示页面
 * 展示 Hornet 色彩系统的 WCAG 无障碍标准兼容性
 */

import { Alert, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WCAGContrastChecker } from '@/components/wcag-contrast-checker';
import { hornetNeutral, hornetPrimary } from '@/styles/colors';

export const metadata = {
  title: 'WCAG 无障碍标准演示 | Hornet 色彩系统',
  description: '展示 Hornet 色彩系统的 WCAG 无障碍标准兼容性和对比度检查工具',
};

export default function WCAGDemoPage() {
  return (
    <div className='container mx-auto space-y-12 py-10'>
      <div className='space-y-4 text-center'>
        <h1 className='text-4xl font-bold'>WCAG 无障碍标准演示</h1>
        <p className='mx-auto max-w-2xl text-xl text-muted-foreground'>
          展示 Hornet 色彩系统的 WCAG 无障碍标准兼容性和对比度检查工具
        </p>
      </div>

      <Tabs defaultValue='contrast-checker' className='w-full'>
        <TabsList className='mx-auto grid w-full max-w-md grid-cols-2'>
          <TabsTrigger value='contrast-checker'>对比度检查器</TabsTrigger>
          <TabsTrigger value='color-combinations'>色彩组合</TabsTrigger>
        </TabsList>

        {/* 对比度检查器 */}
        <TabsContent value='contrast-checker' className='mt-6 space-y-8'>
          <section className='space-y-4'>
            <h2 className='text-3xl font-bold'>WCAG 对比度检查器</h2>
            <p className='text-lg text-muted-foreground'>
              使用此工具检查任意两个颜色之间的对比度是否符合 WCAG 2.1 无障碍标准
            </p>
          </section>

          <WCAGContrastChecker
            initialForeground='#FFFFFF'
            initialBackground={hornetPrimary[500]}
            showAdjuster={true}
          />

          <Alert>
            <AlertTitle>关于 WCAG 对比度标准</AlertTitle>
            <p className='mt-2'>
              WCAG (Web Content Accessibility Guidelines) 是由 W3C
              制定的网页内容无障碍指南。
              对比度是衡量前景色（如文本）与背景色之间亮度差异的指标，对于视力障碍用户尤为重要。
            </p>
            <ul className='mt-2 list-inside list-disc space-y-1'>
              <li>
                <strong>AA 级标准</strong>：普通文本至少 4.5:1，大号文本至少 3:1
              </li>
              <li>
                <strong>AAA 级标准</strong>：普通文本至少 7:1，大号文本至少
                4.5:1
              </li>
            </ul>
          </Alert>
        </TabsContent>

        {/* 色彩组合 */}
        <TabsContent value='color-combinations' className='mt-6 space-y-8'>
          <section className='space-y-4'>
            <h2 className='text-3xl font-bold'>Hornet 色彩组合</h2>
            <p className='text-lg text-muted-foreground'>
              Hornet 色彩系统中常用的色彩组合及其对比度评级
            </p>
          </section>

          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            {/* 主色文本组合 */}
            <Card>
              <CardHeader>
                <CardTitle>主色文本组合</CardTitle>
                <CardDescription>使用主色作为背景的文本组合</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div
                  className='rounded-md p-4'
                  style={{ backgroundColor: hornetPrimary[500] }}
                >
                  <p className='mb-2 text-white'>白色文本 on 主色背景</p>
                  <Badge className='text-hornet-primary-500 bg-white'>
                    对比度: 4.7:1 (AA)
                  </Badge>
                </div>

                <div
                  className='rounded-md p-4'
                  style={{ backgroundColor: hornetPrimary[100] }}
                >
                  <p className='text-hornet-primary-900 mb-2'>
                    深色文本 on 浅色背景
                  </p>
                  <Badge>对比度: 8.3:1 (AAA)</Badge>
                </div>
              </CardContent>
            </Card>

            {/* 中性色文本组合 */}
            <Card>
              <CardHeader>
                <CardTitle>中性色文本组合</CardTitle>
                <CardDescription>使用中性色作为背景的文本组合</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div
                  className='rounded-md p-4'
                  style={{ backgroundColor: hornetNeutral[900] }}
                >
                  <p className='mb-2 text-white'>白色文本 on 深色背景</p>
                  <Badge className='text-hornet-neutral-900 bg-white'>
                    对比度: 16:1 (AAA)
                  </Badge>
                </div>

                <div
                  className='rounded-md p-4'
                  style={{ backgroundColor: hornetNeutral[100] }}
                >
                  <p className='text-hornet-neutral-900 mb-2'>
                    深色文本 on 浅色背景
                  </p>
                  <Badge>对比度: 13:1 (AAA)</Badge>
                </div>
              </CardContent>
            </Card>

            {/* 明亮模式组合 */}
            <Card>
              <CardHeader>
                <CardTitle>明亮模式组合</CardTitle>
                <CardDescription>明亮模式下的常用色彩组合</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='border-hornet-neutral-200 rounded-md border bg-white p-4'>
                  <p className='text-hornet-neutral-900 mb-2'>主要文本</p>
                  <p className='text-hornet-neutral-600 mb-2'>次要文本</p>
                  <p className='text-hornet-primary-600 mb-2'>强调文本</p>
                  <Badge>所有组合均符合 AA 标准</Badge>
                </div>
              </CardContent>
            </Card>

            {/* 暗黑模式组合 */}
            <Card className='bg-hornet-neutral-900 border-hornet-neutral-800'>
              <CardHeader>
                <CardTitle className='text-white'>暗黑模式组合</CardTitle>
                <CardDescription className='text-hornet-neutral-400'>
                  暗黑模式下的常用色彩组合
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='bg-hornet-neutral-800 border-hornet-neutral-700 rounded-md border p-4'>
                  <p className='mb-2 text-white'>主要文本</p>
                  <p className='text-hornet-neutral-300 mb-2'>次要文本</p>
                  <p className='text-hornet-primary-300 mb-2'>强调文本</p>
                  <Badge className='bg-hornet-neutral-700 text-white'>
                    所有组合均符合 AA 标准
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
