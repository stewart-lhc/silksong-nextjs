/**
 * WCAG 对比度检查器组件
 * 用于检查和可视化两个颜色之间的对比度
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useEffect, useState } from 'react';
import {
  adjustColorForContrast,
  calculateContrastRatio,
  getContrastRating,
} from '../utils/wcag-validator';

interface ContrastCheckerProps {
  initialForeground?: string;
  initialBackground?: string;
  showAdjuster?: boolean;
}

export function WCAGContrastChecker({
  initialForeground = '#FFFFFF',
  initialBackground = '#C43444',
  showAdjuster = true,
}: ContrastCheckerProps) {
  const [foreground, setForeground] = useState(initialForeground);
  const [background, setBackground] = useState(initialBackground);
  const [contrastRatio, setContrastRatio] = useState(0);
  const [contrastRating, setContrastRating] = useState<{
    normalText: 'AAA' | 'AA' | 'Fail';
    largeText: 'AAA' | 'AA' | 'Fail';
  }>({ normalText: 'Fail', largeText: 'Fail' });
  const [targetRatio, setTargetRatio] = useState(4.5);
  const [adjustForeground, setAdjustForeground] = useState(true);
  const [adjustedColor, setAdjustedColor] = useState('');

  // 计算对比度和评级
  useEffect(() => {
    try {
      const ratio = calculateContrastRatio(foreground, background);
      setContrastRatio(ratio);
      setContrastRating(getContrastRating(ratio));

      if (showAdjuster) {
        const adjusted = adjustColorForContrast(
          foreground,
          background,
          targetRatio,
          adjustForeground
        );
        setAdjustedColor(adjusted);
      }
    } catch (error) {
      console.error('颜色计算错误:', error);
    }
  }, [foreground, background, targetRatio, adjustForeground, showAdjuster]);

  // 应用调整后的颜色
  const applyAdjustedColor = () => {
    if (adjustForeground) {
      setForeground(adjustedColor);
    } else {
      setBackground(adjustedColor);
    }
  };

  // 获取对比度评级的颜色
  const getRatingColor = (rating: 'AAA' | 'AA' | 'Fail') => {
    switch (rating) {
      case 'AAA':
        return 'bg-green-500';
      case 'AA':
        return 'bg-yellow-500';
      case 'Fail':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className='mx-auto w-full max-w-2xl'>
      <CardHeader>
        <CardTitle>WCAG 对比度检查器</CardTitle>
        <CardDescription>
          检查两个颜色之间的对比度是否符合 WCAG 2.1 无障碍标准
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* 颜色输入 */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div className='space-y-2'>
            <Label htmlFor='foreground'>前景色 (文本)</Label>
            <div className='flex items-center gap-2'>
              <div
                className='h-8 w-8 rounded-md border'
                style={{ backgroundColor: foreground }}
              ></div>
              <Input
                id='foreground'
                value={foreground}
                onChange={e => setForeground(e.target.value)}
                placeholder='#FFFFFF'
              />
            </div>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='background'>背景色</Label>
            <div className='flex items-center gap-2'>
              <div
                className='h-8 w-8 rounded-md border'
                style={{ backgroundColor: background }}
              ></div>
              <Input
                id='background'
                value={background}
                onChange={e => setBackground(e.target.value)}
                placeholder='#000000'
              />
            </div>
          </div>
        </div>

        {/* 预览 */}
        <div className='space-y-2'>
          <Label>预览</Label>
          <div
            className='rounded-md p-6 text-center'
            style={{ backgroundColor: background, color: foreground }}
          >
            <p className='text-sm'>小号文本示例 (14px)</p>
            <p className='text-lg'>标准文本示例 (16px)</p>
            <p className='text-xl font-bold'>大号文本示例 (18px 粗体)</p>
          </div>
        </div>

        {/* 对比度结果 */}
        <div className='space-y-2'>
          <Label>对比度结果</Label>
          <div className='rounded-md bg-muted p-4'>
            <div className='flex items-center justify-between'>
              <span className='text-lg font-bold'>
                {contrastRatio.toFixed(2)}:1
              </span>
              <div className='flex gap-2'>
                <Badge
                  className={`${getRatingColor(contrastRating.normalText)}`}
                >
                  普通文本: {contrastRating.normalText}
                </Badge>
                <Badge
                  className={`${getRatingColor(contrastRating.largeText)}`}
                >
                  大号文本: {contrastRating.largeText}
                </Badge>
              </div>
            </div>
            <div className='mt-2 text-sm text-muted-foreground'>
              <p>WCAG 2.1 AA 标准要求:</p>
              <ul className='list-inside list-disc'>
                <li>普通文本 (14px): 对比度至少 4.5:1</li>
                <li>大号文本 (18px 或 14px 粗体): 对比度至少 3:1</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 颜色调整器 */}
        {showAdjuster && (
          <div className='space-y-4 border-t pt-4'>
            <Label>颜色调整器</Label>
            <div className='flex items-center justify-between'>
              <span>目标对比度: {targetRatio.toFixed(1)}:1</span>
              <div className='w-1/2'>
                <Slider
                  value={[targetRatio]}
                  min={3}
                  max={7}
                  step={0.1}
                  onValueChange={value => setTargetRatio(value[0])}
                />
              </div>
            </div>
            <div className='flex items-center justify-between'>
              <span>调整{adjustForeground ? '前景色' : '背景色'}</span>
              <Switch
                checked={adjustForeground}
                onCheckedChange={setAdjustForeground}
              />
            </div>
            {adjustedColor && (
              <div className='flex items-center gap-4'>
                <div
                  className='h-8 w-8 rounded-md border'
                  style={{ backgroundColor: adjustedColor }}
                ></div>
                <span className='font-mono text-sm'>{adjustedColor}</span>
                <Button size='sm' onClick={applyAdjustedColor}>
                  应用调整
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className='flex justify-between text-sm text-muted-foreground'>
        <span>基于 WCAG 2.1 标准</span>
        <span>
          对比度:{' '}
          <span
            className={
              contrastRatio >= 4.5
                ? 'text-green-500'
                : contrastRatio >= 3
                  ? 'text-yellow-500'
                  : 'text-red-500'
            }
          >
            {contrastRatio.toFixed(2)}:1
          </span>
        </span>
      </CardFooter>
    </Card>
  );
}

export default WCAGContrastChecker;
