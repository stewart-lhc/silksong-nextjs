/**
 * Hornet 色彩系统验证组件
 * 用于验证整个色彩系统是否符合 WCAG 无障碍标准
 */

'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
// 移除有问题的导入，使用本地实现
// import { calculateContrastRatio } from '@/utils/wcag-validator';

// 本地实现 WCAG 验证函数
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return { r, g, b };
}

function calculateRelativeLuminance(rgb: {
  r: number;
  g: number;
  b: number;
}): number {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const rsrgb = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gsrgb = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bsrgb = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  return 0.2126 * rsrgb + 0.7152 * gsrgb + 0.0722 * bsrgb;
}

function calculateContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  const l1 = calculateRelativeLuminance(rgb1);
  const l2 = calculateRelativeLuminance(rgb2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

// 定义本地类型，避免导入问题
type WCAGLevel = 'AA' | 'AAA';

interface ColorCombinationResult {
  foreground: string;
  background: string;
  ratio: number;
  passes: boolean;
}

interface ValidationResult {
  passRate: number;
  failedCombinations: ColorCombinationResult[];
  suggestions: Record<string, string>;
  totalCombinations: number;
}

// 本地验证函数
function validateColorSystem(
  colorSystem: Record<string, string>,
  level: WCAGLevel = 'AA'
) {
  const colors = Object.entries(colorSystem);
  const combinations: ColorCombinationResult[] = [];
  const failedCombinations: ColorCombinationResult[] = [];
  const suggestions: Record<string, string> = {};

  const requiredRatio = level === 'AAA' ? 7 : 4.5;

  // 生成所有颜色组合
  for (let i = 0; i < colors.length; i++) {
    for (let j = 0; j < colors.length; j++) {
      if (i !== j) {
        const [fgName, fgColor] = colors[i];
        const [bgName, bgColor] = colors[j];

        const ratio = calculateContrastRatio(fgColor, bgColor);
        const passes = ratio >= requiredRatio;

        const combination: ColorCombinationResult = {
          foreground: fgColor,
          background: bgColor,
          ratio,
          passes,
        };

        combinations.push(combination);

        if (!passes) {
          failedCombinations.push(combination);
          suggestions[`${fgColor}_${bgColor}`] =
            `建议调整 ${fgName} 或 ${bgName} 的亮度，当前对比度 ${ratio.toFixed(2)}:1，需要至少 ${requiredRatio}:1`;
        }
      }
    }
  }

  const passRate =
    (combinations.length - failedCombinations.length) / combinations.length;

  return {
    passRate,
    failedCombinations,
    suggestions,
    totalCombinations: combinations.length,
  };
}

// 导入 Hornet 色彩系统
const hornetColors = {
  'primary-500': '#C43444',
  'primary-400': '#D45A67',
  'primary-600': '#A42D3A',
  'neutral-100': '#F8F9FA',
  'neutral-900': '#212529',
  'success-500': '#10B981',
  'warning-500': '#F59E0B',
  'error-500': '#EF4444',
  'info-500': '#3B82F6',
};

interface ColorSystemValidatorProps {
  colorSystem?: Record<string, string>;
  level?: WCAGLevel;
  className?: string;
}

export function ColorSystemValidator({
  colorSystem = hornetColors,
  level = 'AA',
  className,
}: ColorSystemValidatorProps) {
  const [wcagLevel, setWcagLevel] = useState<WCAGLevel>(level);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // 执行验证
  const runValidation = () => {
    setIsValidating(true);

    // 使用 setTimeout 避免 UI 阻塞
    setTimeout(() => {
      try {
        const result = validateColorSystem(colorSystem, wcagLevel);
        setValidationResult(result);
      } catch (error) {
        console.error('验证色彩系统时出错:', error);
      } finally {
        setIsValidating(false);
      }
    }, 100);
  };

  // 获取通过率等级样式
  const getPassRateStyle = (rate: number) => {
    if (rate >= 0.9) return 'bg-green-500';
    if (rate >= 0.7) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // 获取对比度等级样式
  const getContrastStyle = (ratio: number) => {
    if (ratio >= 7) return 'bg-green-500 text-white';
    if (ratio >= 4.5) return 'bg-blue-500 text-white';
    if (ratio >= 3) return 'bg-yellow-500 text-black';
    return 'bg-red-500 text-white';
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle>Hornet 色彩系统验证</CardTitle>
        <CardDescription>
          验证整个色彩系统的颜色组合是否符合 WCAG 无障碍标准
        </CardDescription>
      </CardHeader>

      <CardContent className='space-y-6'>
        <div className='flex items-center justify-between'>
          <div className='space-y-1'>
            <h3 className='text-lg font-medium'>WCAG 级别</h3>
            <div className='flex space-x-2'>
              <Button
                variant={wcagLevel === 'AA' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setWcagLevel('AA')}
              >
                AA 级别
              </Button>
              <Button
                variant={wcagLevel === 'AAA' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setWcagLevel('AAA')}
              >
                AAA 级别
              </Button>
            </div>
          </div>

          <Button onClick={runValidation} disabled={isValidating}>
            {isValidating ? '验证中...' : '开始验证'}
          </Button>
        </div>

        {isValidating && (
          <div className='space-y-2'>
            <p>正在验证色彩系统，请稍候...</p>
            <Progress value={50} className='w-full' />
          </div>
        )}

        {validationResult && (
          <Tabs defaultValue='summary'>
            <TabsList className='grid w-full grid-cols-3'>
              <TabsTrigger value='summary'>验证摘要</TabsTrigger>
              <TabsTrigger value='failures'>失败组合</TabsTrigger>
              <TabsTrigger value='suggestions'>改进建议</TabsTrigger>
            </TabsList>

            <TabsContent value='summary' className='mt-4 space-y-4'>
              <div className='space-y-2'>
                <h3 className='text-lg font-medium'>通过率</h3>
                <div className='flex items-center space-x-4'>
                  <Progress
                    value={validationResult.passRate * 100}
                    className={`h-4 w-full ${getPassRateStyle(validationResult.passRate)}`}
                  />
                  <span className='font-bold'>
                    {Math.round(validationResult.passRate * 100)}%
                  </span>
                </div>
              </div>

              <Alert
                variant={
                  validationResult.passRate >= 0.9 ? 'default' : 'destructive'
                }
              >
                <AlertTitle>验证结果</AlertTitle>
                <AlertDescription>
                  {validationResult.passRate >= 0.9
                    ? `色彩系统通过了 ${wcagLevel} 级别验证，通过率为 ${Math.round(validationResult.passRate * 100)}%。`
                    : `色彩系统未完全通过 ${wcagLevel} 级别验证，通过率为 ${Math.round(validationResult.passRate * 100)}%。请查看失败组合和改进建议。`}
                </AlertDescription>
              </Alert>

              <div>
                <h3 className='mb-2 text-lg font-medium'>验证统计</h3>
                <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
                  <Card>
                    <CardContent className='pt-6'>
                      <div className='text-center'>
                        <p className='text-sm text-muted-foreground'>
                          颜色总数
                        </p>
                        <p className='text-3xl font-bold'>
                          {Object.keys(colorSystem).length}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className='pt-6'>
                      <div className='text-center'>
                        <p className='text-sm text-muted-foreground'>
                          组合总数
                        </p>
                        <p className='text-3xl font-bold'>
                          {validationResult.failedCombinations.length +
                            Math.round(
                              (validationResult.failedCombinations.length /
                                (1 - validationResult.passRate)) *
                                validationResult.passRate
                            )}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className='pt-6'>
                      <div className='text-center'>
                        <p className='text-sm text-muted-foreground'>
                          通过组合
                        </p>
                        <p className='text-3xl font-bold text-green-600'>
                          {Math.round(
                            (validationResult.failedCombinations.length /
                              (1 - validationResult.passRate)) *
                              validationResult.passRate
                          )}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className='pt-6'>
                      <div className='text-center'>
                        <p className='text-sm text-muted-foreground'>
                          失败组合
                        </p>
                        <p className='text-3xl font-bold text-red-600'>
                          {validationResult.failedCombinations.length}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value='failures' className='mt-4'>
              {validationResult.failedCombinations.length > 0 ? (
                <div className='space-y-4'>
                  <Alert variant='destructive'>
                    <AlertTitle>失败的颜色组合</AlertTitle>
                    <AlertDescription>
                      以下颜色组合未达到 {wcagLevel} 级别的对比度要求
                    </AlertDescription>
                  </Alert>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>前景色</TableHead>
                        <TableHead>背景色</TableHead>
                        <TableHead>对比度</TableHead>
                        <TableHead>要求</TableHead>
                        <TableHead>状态</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {validationResult.failedCombinations
                        .slice(0, 10)
                        .map((combo: ColorCombinationResult, index: number) => (
                          <TableRow key={index}>
                            <TableCell>
                              <div className='flex items-center space-x-2'>
                                <div
                                  className='h-6 w-6 rounded border'
                                  style={{ backgroundColor: combo.foreground }}
                                />
                                <span className='font-mono text-sm'>
                                  {combo.foreground}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className='flex items-center space-x-2'>
                                <div
                                  className='h-6 w-6 rounded border'
                                  style={{ backgroundColor: combo.background }}
                                />
                                <span className='font-mono text-sm'>
                                  {combo.background}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getContrastStyle(combo.ratio)}>
                                {combo.ratio.toFixed(2)}:1
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {wcagLevel === 'AA' ? '≥ 4.5:1' : '≥ 7:1'}
                            </TableCell>
                            <TableCell>
                              <span className='text-red-500'>未通过</span>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>

                  {validationResult.failedCombinations.length > 10 && (
                    <p className='text-center text-sm text-muted-foreground'>
                      显示前 10 个失败组合（共{' '}
                      {validationResult.failedCombinations.length} 个）
                    </p>
                  )}
                </div>
              ) : (
                <Alert>
                  <AlertTitle>恭喜！</AlertTitle>
                  <AlertDescription>
                    所有颜色组合都通过了 {wcagLevel} 级别的对比度要求。
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value='suggestions' className='mt-4'>
              <div className='space-y-4'>
                <Alert>
                  <AlertTitle>改进建议</AlertTitle>
                  <AlertDescription>
                    根据验证结果，以下是提高色彩系统无障碍性的建议
                  </AlertDescription>
                </Alert>

                {validationResult.failedCombinations.length > 0 ? (
                  <div className='space-y-4'>
                    {Object.entries(validationResult.suggestions)
                      .slice(0, 5)
                      .map(
                        ([key, suggestion]: [string, string], index: number) => {
                          const [fg, bg] = key.split('_');
                          return (
                            <Card key={index}>
                              <CardContent className='pt-6'>
                                <div className='mb-2 flex items-center space-x-2'>
                                  <div
                                    className='h-6 w-6 rounded border'
                                    style={{ backgroundColor: fg }}
                                  />
                                  <span className='font-mono text-sm'>
                                    {fg}
                                  </span>
                                  <span>+</span>
                                  <div
                                    className='h-6 w-6 rounded border'
                                    style={{ backgroundColor: bg }}
                                  />
                                  <span className='font-mono text-sm'>
                                    {bg}
                                  </span>
                                </div>
                                <p>{suggestion}</p>
                              </CardContent>
                            </Card>
                          );
                        }
                      )}

                    {Object.keys(validationResult.suggestions).length > 5 && (
                      <p className='text-center text-sm text-muted-foreground'>
                        显示前 5 个建议（共{' '}
                        {Object.keys(validationResult.suggestions).length} 个）
                      </p>
                    )}

                    <Alert>
                      <AlertTitle>通用建议</AlertTitle>
                      <AlertDescription>
                        <ul className='list-disc space-y-1 pl-5'>
                          <li>增加主要文本颜色与背景色之间的对比度</li>
                          <li>避免在浅色背景上使用浅色文本</li>
                          <li>考虑为重要内容使用更高的对比度</li>
                          <li>确保交互元素（如按钮、链接）有足够的对比度</li>
                          <li>测试色彩系统在不同设备和光线条件下的可读性</li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  <Alert variant='default'>
                    <AlertTitle>无需改进</AlertTitle>
                    <AlertDescription>
                      您的色彩系统已经符合 {wcagLevel}{' '}
                      级别的无障碍标准，无需进一步改进。
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}

export default ColorSystemValidator;
