import { mean, median, standardDeviation, variance, min, max, quantile } from 'simple-statistics';
import { AnalyticsData, QuestionMetric } from '@/types/charts';

export interface StatisticalTest {
  testName: string;
  testStatistic: number;
  pValue: number;
  significance: 'significant' | 'not-significant';
  confidenceInterval?: [number, number];
  description: string;
}

export interface CorrelationResult {
  coefficient: number;
  strength: 'very-weak' | 'weak' | 'moderate' | 'strong' | 'very-strong';
  direction: 'positive' | 'negative';
  pValue?: number;
  significance?: 'significant' | 'not-significant';
}

export interface DescriptiveStats {
  count: number;
  mean: number;
  median: number;
  mode?: number;
  standardDeviation: number;
  variance: number;
  min: number;
  max: number;
  range: number;
  q1: number;
  q3: number;
  iqr: number;
  skewness?: number;
  kurtosis?: number;
}

export interface CrossTabulation {
  question1: string;
  question2: string;
  table: { [key: string]: { [key: string]: number } };
  chiSquareTest?: StatisticalTest;
  cramersV?: number;
}

export interface TrendAnalysis {
  trend: 'increasing' | 'decreasing' | 'stable';
  slope: number;
  rSquared: number;
  forecast?: { timestamp: Date; predicted: number; confidence: [number, number] }[];
  seasonality?: {
    detected: boolean;
    period?: number;
    strength?: number;
  };
}

export class StatisticalAnalyzer {
  private significanceLevel: number = 0.05;

  constructor(significanceLevel: number = 0.05) {
    this.significanceLevel = significanceLevel;
  }

  /**
   * Calculate descriptive statistics for numerical data
   */
  calculateDescriptiveStats(values: number[]): DescriptiveStats {
    if (values.length === 0) {
      throw new Error('Cannot calculate statistics for empty array');
    }

    const sortedValues = [...values].sort((a, b) => a - b);
    const meanValue = mean(values);
    const medianValue = median(values);
    const stdDev = standardDeviation(values);
    const varianceValue = variance(values);
    const minValue = min(values);
    const maxValue = max(values);
    const q1 = quantile(values, 0.25);
    const q3 = quantile(values, 0.75);

    return {
      count: values.length,
      mean: meanValue,
      median: medianValue,
      mode: this.calculateMode(values),
      standardDeviation: stdDev,
      variance: varianceValue,
      min: minValue,
      max: maxValue,
      range: maxValue - minValue,
      q1,
      q3,
      iqr: q3 - q1,
      skewness: this.calculateSkewness(values),
      kurtosis: this.calculateKurtosis(values)
    };
  }

  /**
   * Perform t-test for comparing two groups
   */
  performTTest(
    group1: number[], 
    group2: number[], 
    type: 'one-sample' | 'two-sample' | 'paired' = 'two-sample',
    populationMean?: number
  ): StatisticalTest {
    if (type === 'one-sample' && populationMean === undefined) {
      throw new Error('Population mean required for one-sample t-test');
    }

    let testStatistic: number;
    let degreesOfFreedom: number;
    let description: string;

    if (type === 'one-sample') {
      const sampleMean = mean(group1);
      const sampleStd = standardDeviation(group1);
      const n = group1.length;
      
      testStatistic = (sampleMean - populationMean!) / (sampleStd / Math.sqrt(n));
      degreesOfFreedom = n - 1;
      description = `One-sample t-test comparing sample mean (${sampleMean.toFixed(2)}) to population mean (${populationMean})`;
    
    } else if (type === 'paired') {
      if (group1.length !== group2.length) {
        throw new Error('Paired t-test requires equal sample sizes');
      }
      
      const differences = group1.map((val, i) => val - group2[i]);
      const diffMean = mean(differences);
      const diffStd = standardDeviation(differences);
      const n = differences.length;
      
      testStatistic = diffMean / (diffStd / Math.sqrt(n));
      degreesOfFreedom = n - 1;
      description = `Paired t-test comparing differences between two related groups`;
    
    } else {
      // Two-sample t-test (assuming unequal variances - Welch's t-test)
      const mean1 = mean(group1);
      const mean2 = mean(group2);
      const var1 = variance(group1);
      const var2 = variance(group2);
      const n1 = group1.length;
      const n2 = group2.length;
      
      const pooledSE = Math.sqrt(var1/n1 + var2/n2);
      testStatistic = (mean1 - mean2) / pooledSE;
      
      // Welch-Satterthwaite equation for degrees of freedom
      degreesOfFreedom = Math.pow(var1/n1 + var2/n2, 2) / 
        (Math.pow(var1/n1, 2)/(n1-1) + Math.pow(var2/n2, 2)/(n2-1));
      
      description = `Two-sample t-test comparing group means (${mean1.toFixed(2)} vs ${mean2.toFixed(2)})`;
    }

    const pValue = this.calculateTTestPValue(testStatistic, degreesOfFreedom);
    const significance = pValue < this.significanceLevel ? 'significant' : 'not-significant';

    return {
      testName: `${type} t-test`,
      testStatistic,
      pValue,
      significance,
      description
    };
  }

  /**
   * Calculate correlation between two variables
   */
  calculateCorrelation(x: number[], y: number[]): CorrelationResult {
    if (x.length !== y.length) {
      throw new Error('Arrays must have equal length for correlation analysis');
    }

    if (x.length < 2) {
      throw new Error('Need at least 2 data points for correlation');
    }

    // Pearson correlation coefficient
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    if (denominator === 0) {
      return {
        coefficient: 0,
        strength: 'very-weak',
        direction: 'positive'
      };
    }

    const coefficient = numerator / denominator;
    const absCoeff = Math.abs(coefficient);
    
    let strength: CorrelationResult['strength'];
    if (absCoeff < 0.2) strength = 'very-weak';
    else if (absCoeff < 0.4) strength = 'weak';
    else if (absCoeff < 0.6) strength = 'moderate';
    else if (absCoeff < 0.8) strength = 'strong';
    else strength = 'very-strong';

    const direction = coefficient >= 0 ? 'positive' : 'negative';

    // Calculate p-value for correlation
    const tStat = coefficient * Math.sqrt((n - 2) / (1 - coefficient * coefficient));
    const pValue = this.calculateTTestPValue(tStat, n - 2);
    const significance = pValue < this.significanceLevel ? 'significant' : 'not-significant';

    return {
      coefficient,
      strength,
      direction,
      pValue,
      significance
    };
  }

  /**
   * Perform chi-square test for independence
   */
  performChiSquareTest(observedFrequencies: number[][]): StatisticalTest {
    const rows = observedFrequencies.length;
    const cols = observedFrequencies[0].length;
    
    // Calculate totals
    const rowTotals = observedFrequencies.map(row => row.reduce((a, b) => a + b, 0));
    const colTotals = Array(cols).fill(0);
    for (let j = 0; j < cols; j++) {
      for (let i = 0; i < rows; i++) {
        colTotals[j] += observedFrequencies[i][j];
      }
    }
    const grandTotal = rowTotals.reduce((a, b) => a + b, 0);

    // Calculate expected frequencies
    const expectedFrequencies: number[][] = [];
    for (let i = 0; i < rows; i++) {
      expectedFrequencies[i] = [];
      for (let j = 0; j < cols; j++) {
        expectedFrequencies[i][j] = (rowTotals[i] * colTotals[j]) / grandTotal;
      }
    }

    // Calculate chi-square statistic
    let chiSquare = 0;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const observed = observedFrequencies[i][j];
        const expected = expectedFrequencies[i][j];
        chiSquare += Math.pow(observed - expected, 2) / expected;
      }
    }

    const degreesOfFreedom = (rows - 1) * (cols - 1);
    const pValue = this.calculateChiSquarePValue(chiSquare, degreesOfFreedom);
    const significance = pValue < this.significanceLevel ? 'significant' : 'not-significant';

    return {
      testName: 'Chi-square test of independence',
      testStatistic: chiSquare,
      pValue,
      significance,
      description: `Testing independence between categorical variables (${rows}x${cols} table)`
    };
  }

  /**
   * Create cross-tabulation table
   */
  createCrossTabulation(
    variable1: string[],
    variable2: string[],
    variable1Name: string,
    variable2Name: string
  ): CrossTabulation {
    if (variable1.length !== variable2.length) {
      throw new Error('Variables must have equal length');
    }

    // Get unique values
    const uniqueVar1 = [...new Set(variable1)].sort();
    const uniqueVar2 = [...new Set(variable2)].sort();

    // Create frequency table
    const table: { [key: string]: { [key: string]: number } } = {};
    
    uniqueVar1.forEach(val1 => {
      table[val1] = {};
      uniqueVar2.forEach(val2 => {
        table[val1][val2] = 0;
      });
    });

    // Fill table with frequencies
    for (let i = 0; i < variable1.length; i++) {
      table[variable1[i]][variable2[i]]++;
    }

    // Convert to matrix for chi-square test
    const observedMatrix: number[][] = uniqueVar1.map(val1 =>
      uniqueVar2.map(val2 => table[val1][val2])
    );

    const chiSquareTest = this.performChiSquareTest(observedMatrix);
    const cramersV = this.calculateCramersV(observedMatrix);

    return {
      question1: variable1Name,
      question2: variable2Name,
      table,
      chiSquareTest,
      cramersV
    };
  }

  /**
   * Perform trend analysis on time series data
   */
  analyzeTrend(
    timestamps: Date[],
    values: number[],
    forecastPeriods: number = 7
  ): TrendAnalysis {
    if (timestamps.length !== values.length) {
      throw new Error('Timestamps and values must have equal length');
    }

    if (timestamps.length < 3) {
      throw new Error('Need at least 3 data points for trend analysis');
    }

    // Convert timestamps to numerical values (days since first timestamp)
    const baseTime = timestamps[0].getTime();
    const x = timestamps.map(t => (t.getTime() - baseTime) / (1000 * 60 * 60 * 24));
    const y = values;

    // Linear regression
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate R-squared
    const meanY = sumY / n;
    const totalSumSquares = y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0);
    const residualSumSquares = y.reduce((sum, yi, i) => {
      const predicted = slope * x[i] + intercept;
      return sum + Math.pow(yi - predicted, 2);
    }, 0);
    const rSquared = 1 - (residualSumSquares / totalSumSquares);

    // Determine trend direction
    let trend: TrendAnalysis['trend'];
    if (Math.abs(slope) < 0.01) {
      trend = 'stable';
    } else if (slope > 0) {
      trend = 'increasing';
    } else {
      trend = 'decreasing';
    }

    // Generate forecast
    const forecast: TrendAnalysis['forecast'] = [];
    const lastX = x[x.length - 1];
    const standardError = Math.sqrt(residualSumSquares / (n - 2));

    for (let i = 1; i <= forecastPeriods; i++) {
      const futureX = lastX + i;
      const predicted = slope * futureX + intercept;
      const futureDate = new Date(baseTime + futureX * 24 * 60 * 60 * 1000);
      
      // Simple confidence interval (±1.96 * SE for 95% CI)
      const margin = 1.96 * standardError;
      
      forecast.push({
        timestamp: futureDate,
        predicted,
        confidence: [predicted - margin, predicted + margin]
      });
    }

    // Basic seasonality detection (simplified)
    const seasonality = this.detectSeasonality(values);

    return {
      trend,
      slope,
      rSquared,
      forecast,
      seasonality
    };
  }

  /**
   * Analyze survey question performance
   */
  analyzeQuestionPerformance(questionMetrics: QuestionMetric[]): {
    problematicQuestions: QuestionMetric[];
    recommendations: string[];
    correlations: CorrelationResult[];
  } {
    const problematicQuestions: QuestionMetric[] = [];
    const recommendations: string[] = [];

    // Identify problematic questions
    questionMetrics.forEach(metric => {
      if (metric.responseRate < 80) {
        problematicQuestions.push(metric);
        recommendations.push(
          `Question "${metric.question.substring(0, 50)}..." has low response rate (${metric.responseRate}%). Consider simplifying or making it optional.`
        );
      }
      
      if (metric.avgTime && metric.avgTime > 60) {
        problematicQuestions.push(metric);
        recommendations.push(
          `Question "${metric.question.substring(0, 50)}..." takes too long to answer (${metric.avgTime}s). Consider breaking it down or providing clearer instructions.`
        );
      }
      
      if (metric.dropOffRate && metric.dropOffRate > 10) {
        problematicQuestions.push(metric);
        recommendations.push(
          `Question "${metric.question.substring(0, 50)}..." has high drop-off rate (${metric.dropOffRate}%). Review question relevance and placement.`
        );
      }
    });

    // Calculate correlations between metrics
    const correlations: CorrelationResult[] = [];
    
    if (questionMetrics.length > 2) {
      const responseRates = questionMetrics.map(m => m.responseRate);
      const avgTimes = questionMetrics.filter(m => m.avgTime).map(m => m.avgTime!);
      const dropOffRates = questionMetrics.filter(m => m.dropOffRate).map(m => m.dropOffRate!);

      if (avgTimes.length > 2) {
        const timeResponseCorr = this.calculateCorrelation(
          avgTimes.slice(0, responseRates.length),
          responseRates.slice(0, avgTimes.length)
        );
        correlations.push(timeResponseCorr);
      }

      if (dropOffRates.length > 2) {
        const dropOffResponseCorr = this.calculateCorrelation(
          dropOffRates.slice(0, responseRates.length),
          responseRates.slice(0, dropOffRates.length)
        );
        correlations.push(dropOffResponseCorr);
      }
    }

    return {
      problematicQuestions: [...new Set(problematicQuestions)],
      recommendations,
      correlations
    };
  }

  // Private helper methods

  private calculateMode(values: number[]): number | undefined {
    const frequency: { [key: number]: number } = {};
    let maxFreq = 0;
    let mode: number | undefined;

    values.forEach(value => {
      frequency[value] = (frequency[value] || 0) + 1;
      if (frequency[value] > maxFreq) {
        maxFreq = frequency[value];
        mode = value;
      }
    });

    return maxFreq > 1 ? mode : undefined;
  }

  private calculateSkewness(values: number[]): number {
    const meanValue = mean(values);
    const stdDev = standardDeviation(values);
    const n = values.length;
    
    const skewness = values.reduce((sum, value) => {
      return sum + Math.pow((value - meanValue) / stdDev, 3);
    }, 0) / n;
    
    return skewness;
  }

  private calculateKurtosis(values: number[]): number {
    const meanValue = mean(values);
    const stdDev = standardDeviation(values);
    const n = values.length;
    
    const kurtosis = values.reduce((sum, value) => {
      return sum + Math.pow((value - meanValue) / stdDev, 4);
    }, 0) / n;
    
    return kurtosis - 3; // Excess kurtosis
  }

  private calculateTTestPValue(testStatistic: number, degreesOfFreedom: number): number {
    // Simplified p-value calculation using approximation
    // In a real implementation, you'd use a proper t-distribution function
    const absT = Math.abs(testStatistic);
    
    if (absT > 3.5) return 0.001;
    if (absT > 2.5) return 0.01;
    if (absT > 1.96) return 0.05;
    if (absT > 1.5) return 0.1;
    
    return 0.2;
  }

  private calculateChiSquarePValue(chiSquare: number, degreesOfFreedom: number): number {
    // Simplified p-value calculation
    // In a real implementation, you'd use a proper chi-square distribution function
    if (chiSquare > 15) return 0.001;
    if (chiSquare > 9) return 0.01;
    if (chiSquare > 6) return 0.05;
    if (chiSquare > 3) return 0.1;
    
    return 0.2;
  }

  private calculateCramersV(observedMatrix: number[][]): number {
    const chiSquareTest = this.performChiSquareTest(observedMatrix);
    const n = observedMatrix.reduce((sum, row) => sum + row.reduce((a, b) => a + b, 0), 0);
    const k = Math.min(observedMatrix.length, observedMatrix[0].length);
    
    return Math.sqrt(chiSquareTest.testStatistic / (n * (k - 1)));
  }

  private detectSeasonality(values: number[]): TrendAnalysis['seasonality'] {
    if (values.length < 14) {
      return { detected: false };
    }

    // Simple seasonality detection using autocorrelation
    // Check for weekly pattern (period = 7)
    const period = 7;
    if (values.length < period * 2) {
      return { detected: false };
    }

    let correlation = 0;
    let count = 0;
    
    for (let i = 0; i < values.length - period; i++) {
      correlation += values[i] * values[i + period];
      count++;
    }
    
    correlation = correlation / count;
    const meanSquare = values.reduce((sum, val) => sum + val * val, 0) / values.length;
    const normalizedCorrelation = correlation / meanSquare;
    
    const detected = normalizedCorrelation > 0.3;
    
    return {
      detected,
      period: detected ? period : undefined,
      strength: detected ? normalizedCorrelation : undefined
    };
  }
}

// Singleton instance
export const statisticalAnalyzer = new StatisticalAnalyzer();