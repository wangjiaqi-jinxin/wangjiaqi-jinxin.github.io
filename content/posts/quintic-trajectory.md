---
title: 离散五次多项式轨迹融合：从 PVA 边界到平滑过渡
date: "2026-09-20"
tags: [Robot, Motion Planning, C++]
summary: 用位置、速度和加速度边界构造可验证的局部平滑过渡。
readingTime: 8
---

## 问题背景

轨迹切换时，直接连接两个位置通常不够。位置虽然连续，速度和加速度仍可能突变，从而造成跟踪误差、机械冲击或动力学限制触发。

实用做法是在旧轨迹的接管边界和新目标之间插入一段短过渡轨迹。关键是继承起点和终点的 PVA（位置、速度、加速度）状态。

## PVA 边界

设过渡时长为 $T$，起点为 $(p_0,v_0,a_0)$，终点为 $(p_1,v_1,a_1)$。五次多项式有六个系数，恰好对应六个边界约束：

$$
p(t)=c_0+c_1t+c_2t^2+c_3t^3+c_4t^4+c_5t^5
$$

在离散 Servo 系统里，边界最好与控制器使用的差分方式保持一致。若采样周期为 $\Delta t$，控制层实际看到的是：

$$
v_k=\frac{p_k-p_{k-1}}{\Delta t},\quad a_k=\frac{v_k-v_{k-1}}{\Delta t}
$$

因此，连续函数上的导数平滑并不自动等于离散点列的第一帧平滑。

## 为什么选择五次多项式

三次多项式可同时保证位置和速度连续，但不能完整约束两端加速度。五次多项式可以达到 C² 连续；不过 Jerk 仍须在离散点列上重新计算并限幅。

融合长度也不应该固定为某一个点数。更合理的策略是从满足数学边界的最小采样长度开始，逐步延长，直到关节和 TCP 的速度、加速度、Jerk 都通过校验。

## C++ 接口

```cpp
struct PvaState {
  double p;
  double v;
  double a;
};

bool buildQuinticTransition(
    const PvaState& start,
    const PvaState& goal,
    double duration,
    QuinticCoefficients& out) {
  if (duration <= 0.0) return false;
  out.c0 = start.p;
  out.c1 = start.v;
  out.c2 = 0.5 * start.a;
  return solveRemainingCoefficients(start, goal, duration, out);
}
```

## 验证与结论

生成系数后，应按真实控制周期采样，检查端点误差和完整拼接处的 V/A/J。五次多项式不是完整的路径规划器，但作为局部融合段，它足够直接、可解释，也容易接入现有控制器。
