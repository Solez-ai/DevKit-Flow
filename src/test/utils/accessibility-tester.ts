/**
 * Accessibility Testing Utilities
 * Provides tools for automated accessibility testing
 */

export interface AccessibilityIssue {
  id: string;
  severity: 'error' | 'warning' | 'info';
  wcagLevel: 'A' | 'AA' | 'AAA';
  wcagCriteria: string;
  description: string;
  element?: string;
  selector?: string;
  recommendation: string;
}

export interface AccessibilityTestResult {
  testName: string;
  passed: boolean;
  score: number; // 0-100
  issues: AccessibilityIssue[];
  summary: {
    errors: number;
    warnings: number;
    info: number;
    totalChecks: number;
  };
  timestamp: number;
}

export interface AccessibilityTestOptions {
  wcagLevel: 'A' | 'AA' | 'AAA';
  includeWarnings: boolean;
  checkColorContrast: boolean;
  checkKeyboardNavigation: boolean;
  checkScreenReader: boolean;
  checkFocus: boolean;
}

export class AccessibilityTester {
  private defaultOptions: AccessibilityTestOptions = {
    wcagLevel: 'AA',
    includeWarnings: true,
    checkColorContrast: true,
    checkKeyboardNavigation: true,
    checkScreenReader: true,
    checkFocus: true
  };

  async testElement(
    element: HTMLElement,
    testName: string,
    options: Partial<AccessibilityTestOptions> = {}
  ): Promise<AccessibilityTestResult> {
    const opts = { ...this.defaultOptions, ...options };
    const issues: AccessibilityIssue[] = [];
    let totalChecks = 0;

    // Check ARIA attributes
    if (opts.checkScreenReader) {
      issues.push(...this.checkAriaAttributes(element));
      totalChecks += 5;
    }

    // Check semantic HTML
    issues.push(...this.checkSemanticHTML(element));
    totalChecks += 3;

    // Check keyboard navigation
    if (opts.checkKeyboardNavigation) {
      issues.push(...this.checkKeyboardNavigation(element));
      totalChecks += 4;
    }

    // Check focus management
    if (opts.checkFocus) {
      issues.push(...this.checkFocusManagement(element));
      totalChecks += 3;
    }

    // Check color contrast
    if (opts.checkColorContrast) {
      issues.push(...await this.checkColorContrast(element, opts.wcagLevel));
      totalChecks += 2;
    }

    // Check form accessibility
    issues.push(...this.checkFormAccessibility(element));
    totalChecks += 4;

    // Check image accessibility
    issues.push(...this.checkImageAccessibility(element));
    totalChecks += 2;

    // Filter issues by WCAG level and severity
    const filteredIssues = issues.filter(issue => {
      const levelOrder = { 'A': 1, 'AA': 2, 'AAA': 3 };
      return levelOrder[issue.wcagLevel] <= levelOrder[opts.wcagLevel] &&
             (opts.includeWarnings || issue.severity === 'error');
    });

    const summary = {
      errors: filteredIssues.filter(i => i.severity === 'error').length,
      warnings: filteredIssues.filter(i => i.severity === 'warning').length,
      info: filteredIssues.filter(i => i.severity === 'info').length,
      totalChecks
    };

    const score = Math.max(0, 100 - (summary.errors * 10 + summary.warnings * 5 + summary.info * 1));

    return {
      testName,
      passed: summary.errors === 0,
      score,
      issues: filteredIssues,
      summary,
      timestamp: Date.now()
    };
  }

  private checkAriaAttributes(element: HTMLElement): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];

    // Check for interactive elements without ARIA labels
    const interactiveElements = element.querySelectorAll('button, a, input, select, textarea, [role="button"], [role="link"]');
    interactiveElements.forEach((el, index) => {
      const hasLabel = el.hasAttribute('aria-label') || 
                      el.hasAttribute('aria-labelledby') || 
                      el.textContent?.trim() ||
                      el.querySelector('img')?.hasAttribute('alt');

      if (!hasLabel) {
        issues.push({
          id: `aria-label-missing-${index}`,
          severity: 'error',
          wcagLevel: 'A',
          wcagCriteria: '4.1.2',
          description: 'Interactive element missing accessible name',
          element: el.tagName.toLowerCase(),
          selector: this.getSelector(el as HTMLElement),
          recommendation: 'Add aria-label, aria-labelledby, or visible text content'
        });
      }
    });

    // Check for proper ARIA roles
    const elementsWithRoles = element.querySelectorAll('[role]');
    elementsWithRoles.forEach((el, index) => {
      const role = el.getAttribute('role');
      const validRoles = [
        'button', 'link', 'textbox', 'combobox', 'listbox', 'option',
        'checkbox', 'radio', 'tab', 'tabpanel', 'dialog', 'alert',
        'navigation', 'main', 'banner', 'contentinfo', 'complementary'
      ];

      if (role && !validRoles.includes(role)) {
        issues.push({
          id: `invalid-aria-role-${index}`,
          severity: 'warning',
          wcagLevel: 'A',
          wcagCriteria: '4.1.2',
          description: `Invalid ARIA role: ${role}`,
          element: el.tagName.toLowerCase(),
          selector: this.getSelector(el as HTMLElement),
          recommendation: 'Use a valid ARIA role or remove the role attribute'
        });
      }
    });

    return issues;
  }

  private checkSemanticHTML(element: HTMLElement): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];

    // Check for heading hierarchy
    const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      if (level > previousLevel + 1) {
        issues.push({
          id: `heading-hierarchy-${index}`,
          severity: 'warning',
          wcagLevel: 'AA',
          wcagCriteria: '1.3.1',
          description: `Heading level skipped from h${previousLevel} to h${level}`,
          element: heading.tagName.toLowerCase(),
          selector: this.getSelector(heading as HTMLElement),
          recommendation: 'Use heading levels in sequential order'
        });
      }
      previousLevel = level;
    });

    // Check for landmark elements
    const hasMain = element.querySelector('main, [role="main"]');
    if (!hasMain && element.tagName !== 'MAIN') {
      issues.push({
        id: 'missing-main-landmark',
        severity: 'warning',
        wcagLevel: 'AA',
        wcagCriteria: '1.3.1',
        description: 'Page missing main landmark',
        recommendation: 'Add a <main> element or role="main" to identify the main content area'
      });
    }

    return issues;
  }

  private checkKeyboardNavigation(element: HTMLElement): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];

    // Check for focusable elements without tabindex
    const interactiveElements = element.querySelectorAll('button, a, input, select, textarea, [onclick], [role="button"]');
    interactiveElements.forEach((el, index) => {
      const isNativelyFocusable = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName);
      const hasTabIndex = el.hasAttribute('tabindex');
      const tabIndex = el.getAttribute('tabindex');

      if (!isNativelyFocusable && !hasTabIndex) {
        issues.push({
          id: `keyboard-focusable-${index}`,
          severity: 'error',
          wcagLevel: 'A',
          wcagCriteria: '2.1.1',
          description: 'Interactive element not keyboard accessible',
          element: el.tagName.toLowerCase(),
          selector: this.getSelector(el as HTMLElement),
          recommendation: 'Add tabindex="0" to make element keyboard focusable'
        });
      }

      if (tabIndex && parseInt(tabIndex) > 0) {
        issues.push({
          id: `positive-tabindex-${index}`,
          severity: 'warning',
          wcagLevel: 'A',
          wcagCriteria: '2.4.3',
          description: 'Positive tabindex disrupts natural tab order',
          element: el.tagName.toLowerCase(),
          selector: this.getSelector(el as HTMLElement),
          recommendation: 'Use tabindex="0" or rely on natural document order'
        });
      }
    });

    return issues;
  }

  private checkFocusManagement(element: HTMLElement): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];

    // Check for focus indicators
    const focusableElements = element.querySelectorAll('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    focusableElements.forEach((el, index) => {
      const computedStyle = window.getComputedStyle(el as Element);
      const hasOutline = computedStyle.outline !== 'none' && computedStyle.outline !== '0px';
      const hasBoxShadow = computedStyle.boxShadow !== 'none';
      const hasBorder = computedStyle.border !== 'none';

      if (!hasOutline && !hasBoxShadow && !hasBorder) {
        issues.push({
          id: `focus-indicator-${index}`,
          severity: 'warning',
          wcagLevel: 'AA',
          wcagCriteria: '2.4.7',
          description: 'Focusable element may lack visible focus indicator',
          element: el.tagName.toLowerCase(),
          selector: this.getSelector(el as HTMLElement),
          recommendation: 'Ensure focus indicators are visible and have sufficient contrast'
        });
      }
    });

    return issues;
  }

  private async checkColorContrast(element: HTMLElement, wcagLevel: 'A' | 'AA' | 'AAA'): Promise<AccessibilityIssue[]> {
    const issues: AccessibilityIssue[] = [];
    const minContrast = wcagLevel === 'AAA' ? 7 : 4.5;
    const minContrastLarge = wcagLevel === 'AAA' ? 4.5 : 3;

    const textElements = element.querySelectorAll('*');
    textElements.forEach((el, index) => {
      const computedStyle = window.getComputedStyle(el);
      const hasText = el.textContent?.trim();

      if (hasText) {
        const fontSize = parseFloat(computedStyle.fontSize);
        const fontWeight = computedStyle.fontWeight;
        const isLargeText = fontSize >= 18 || (fontSize >= 14 && (fontWeight === 'bold' || parseInt(fontWeight) >= 700));

        const requiredContrast = isLargeText ? minContrastLarge : minContrast;
        
        // Note: Actual contrast calculation would require more complex color analysis
        // This is a simplified check
        const textColor = computedStyle.color;
        const backgroundColor = computedStyle.backgroundColor;

        if (textColor === backgroundColor) {
          issues.push({
            id: `color-contrast-${index}`,
            severity: 'error',
            wcagLevel,
            wcagCriteria: '1.4.3',
            description: 'Insufficient color contrast detected',
            element: el.tagName.toLowerCase(),
            selector: this.getSelector(el as HTMLElement),
            recommendation: `Ensure color contrast ratio is at least ${requiredContrast}:1`
          });
        }
      }
    });

    return issues;
  }

  private checkFormAccessibility(element: HTMLElement): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];

    // Check for form labels
    const inputs = element.querySelectorAll('input, select, textarea');
    inputs.forEach((input, index) => {
      const id = input.getAttribute('id');
      const hasLabel = id && element.querySelector(`label[for="${id}"]`);
      const hasAriaLabel = input.hasAttribute('aria-label') || input.hasAttribute('aria-labelledby');

      if (!hasLabel && !hasAriaLabel) {
        issues.push({
          id: `form-label-${index}`,
          severity: 'error',
          wcagLevel: 'A',
          wcagCriteria: '3.3.2',
          description: 'Form input missing accessible label',
          element: input.tagName.toLowerCase(),
          selector: this.getSelector(input as HTMLElement),
          recommendation: 'Add a <label> element or aria-label attribute'
        });
      }
    });

    // Check for fieldsets in complex forms
    const formElements = element.querySelectorAll('form');
    formElements.forEach((form, index) => {
      const radioGroups = form.querySelectorAll('input[type="radio"]');
      const checkboxGroups = form.querySelectorAll('input[type="checkbox"]');

      if (radioGroups.length > 1 || checkboxGroups.length > 1) {
        const hasFieldset = form.querySelector('fieldset');
        if (!hasFieldset) {
          issues.push({
            id: `form-fieldset-${index}`,
            severity: 'warning',
            wcagLevel: 'A',
            wcagCriteria: '1.3.1',
            description: 'Complex form missing fieldset grouping',
            element: 'form',
            selector: this.getSelector(form as HTMLElement),
            recommendation: 'Use <fieldset> and <legend> to group related form controls'
          });
        }
      }
    });

    return issues;
  }

  private checkImageAccessibility(element: HTMLElement): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];

    const images = element.querySelectorAll('img');
    images.forEach((img, index) => {
      const alt = img.getAttribute('alt');
      const isDecorative = alt === '';
      const hasAlt = alt !== null;

      if (!hasAlt) {
        issues.push({
          id: `img-alt-${index}`,
          severity: 'error',
          wcagLevel: 'A',
          wcagCriteria: '1.1.1',
          description: 'Image missing alt attribute',
          element: 'img',
          selector: this.getSelector(img),
          recommendation: 'Add alt attribute with descriptive text or empty string for decorative images'
        });
      } else if (!isDecorative && alt.trim().length === 0) {
        issues.push({
          id: `img-alt-empty-${index}`,
          severity: 'warning',
          wcagLevel: 'A',
          wcagCriteria: '1.1.1',
          description: 'Informative image has empty alt text',
          element: 'img',
          selector: this.getSelector(img),
          recommendation: 'Provide descriptive alt text for informative images'
        });
      }
    });

    return issues;
  }

  private getSelector(element: HTMLElement): string {
    if (element.id) {
      return `#${element.id}`;
    }
    
    if (element.className) {
      return `${element.tagName.toLowerCase()}.${element.className.split(' ').join('.')}`;
    }
    
    return element.tagName.toLowerCase();
  }

  generateAccessibilityReport(results: AccessibilityTestResult[]): string {
    const totalTests = results.length;
    const passedTests = results.filter(r => r.passed).length;
    const averageScore = results.reduce((sum, r) => sum + r.score, 0) / totalTests;

    const allIssues = results.flatMap(r => r.issues);
    const errorCount = allIssues.filter(i => i.severity === 'error').length;
    const warningCount = allIssues.filter(i => i.severity === 'warning').length;

    return `
Accessibility Test Report
========================
Tests Run: ${totalTests}
Tests Passed: ${passedTests}
Pass Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%
Average Score: ${averageScore.toFixed(1)}/100

Issues Summary:
- Errors: ${errorCount}
- Warnings: ${warningCount}
- Total Issues: ${allIssues.length}

Most Common Issues:
${this.getMostCommonIssues(allIssues).map(issue => `- ${issue.description} (${issue.count} occurrences)`).join('\n')}
    `.trim();
  }

  private getMostCommonIssues(issues: AccessibilityIssue[]): Array<{ description: string; count: number }> {
    const issueCounts = new Map<string, number>();
    
    issues.forEach(issue => {
      const key = issue.description;
      issueCounts.set(key, (issueCounts.get(key) || 0) + 1);
    });

    return Array.from(issueCounts.entries())
      .map(([description, count]) => ({ description, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }
}