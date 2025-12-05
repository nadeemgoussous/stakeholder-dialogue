import { test, expect } from '@playwright/test';

test.describe('Stakeholder Profiles (F004)', () => {
  test('should have all 9 stakeholder profiles defined', async ({ page }) => {
    await page.goto('/');

    // Check that stakeholder profiles module loads
    const profilesExist = await page.evaluate(async () => {
      try {
        const module = await import('/src/data/stakeholder-profiles.ts');
        return module.stakeholderProfiles && module.stakeholderProfiles.length === 9;
      } catch (error) {
        return false;
      }
    });

    expect(profilesExist).toBe(true);
  });

  test('should have correct stakeholder IDs', async ({ page }) => {
    await page.goto('/');

    const stakeholderIds = await page.evaluate(async () => {
      const module = await import('/src/data/stakeholder-profiles.ts');
      return module.stakeholderProfiles.map((p: any) => p.id);
    });

    const expectedIds = [
      'policy-makers',
      'grid-operators',
      'industry',
      'public',
      'csos-ngos',
      'scientific',
      'finance',
      'regional-bodies',
      'development-partners'
    ];

    expect(stakeholderIds).toEqual(expectedIds);
  });

  test('should have all required fields for each stakeholder', async ({ page }) => {
    await page.goto('/');

    const allFieldsValid = await page.evaluate(async () => {
      const module = await import('/src/data/stakeholder-profiles.ts');
      const requiredFields = [
        'id', 'name', 'icon', 'color',
        'description', 'whyEngage', 'benefitForThem',
        'challenges', 'goodPractices', 'priorities',
        'typicalQuestions', 'concernTriggers', 'positiveIndicators',
        'responseTemplates'
      ];

      return module.stakeholderProfiles.every((profile: any) =>
        requiredFields.every(field => field in profile)
      );
    });

    expect(allFieldsValid).toBe(true);
  });

  test('should have concern triggers with correct structure', async ({ page }) => {
    await page.goto('/');

    const concernTriggersValid = await page.evaluate(async () => {
      const module = await import('/src/data/stakeholder-profiles.ts');

      return module.stakeholderProfiles.every((profile: any) => {
        if (!Array.isArray(profile.concernTriggers)) return false;

        return profile.concernTriggers.every((trigger: any) =>
          trigger.metric &&
          typeof trigger.threshold === 'number' &&
          (trigger.direction === 'above' || trigger.direction === 'below') &&
          trigger.concernText &&
          trigger.explanation
        );
      });
    });

    expect(concernTriggersValid).toBe(true);
  });

  test('should have positive indicators with correct structure', async ({ page }) => {
    await page.goto('/');

    const positiveIndicatorsValid = await page.evaluate(async () => {
      const module = await import('/src/data/stakeholder-profiles.ts');

      return module.stakeholderProfiles.every((profile: any) => {
        if (!Array.isArray(profile.positiveIndicators)) return false;

        return profile.positiveIndicators.every((indicator: any) =>
          indicator.metric &&
          typeof indicator.threshold === 'number' &&
          (indicator.direction === 'above' || indicator.direction === 'below') &&
          indicator.praiseText
        );
      });
    });

    expect(positiveIndicatorsValid).toBe(true);
  });

  test('should have IRENA toolkit colors assigned', async ({ page }) => {
    await page.goto('/');

    const colorsValid = await page.evaluate(async () => {
      const module = await import('/src/data/stakeholder-profiles.ts');

      const expectedColors = {
        'policy-makers': '#c94f4f',
        'grid-operators': '#4a90a4',
        'industry': '#7b8a3e',
        'public': '#e8a54b',
        'csos-ngos': '#6b4c9a',
        'scientific': '#3d7ea6',
        'finance': '#2e5a3a',
        'regional-bodies': '#1a5276',
        'development-partners': '#117a65'
      };

      return module.stakeholderProfiles.every((profile: any) =>
        profile.color === expectedColors[profile.id as keyof typeof expectedColors]
      );
    });

    expect(colorsValid).toBe(true);
  });

  test('should have helper function getStakeholderById working', async ({ page }) => {
    await page.goto('/');

    const helperWorks = await page.evaluate(async () => {
      const module = await import('/src/data/stakeholder-profiles.ts');
      const profile = module.getStakeholderById('policy-makers');

      return (
        profile !== undefined &&
        profile.id === 'policy-makers' &&
        profile.name === 'Policy Makers & Regulators'
      );
    });

    expect(helperWorks).toBe(true);
  });

  test('should have helper function getAllStakeholderIds working', async ({ page }) => {
    await page.goto('/');

    const helperWorks = await page.evaluate(async () => {
      const module = await import('/src/data/stakeholder-profiles.ts');
      const ids = module.getAllStakeholderIds();

      return ids.length === 9 && ids.includes('policy-makers');
    });

    expect(helperWorks).toBe(true);
  });

  test('should have priorities array populated for all stakeholders', async ({ page }) => {
    await page.goto('/');

    const prioritiesValid = await page.evaluate(async () => {
      const module = await import('/src/data/stakeholder-profiles.ts');

      return module.stakeholderProfiles.every((profile: any) =>
        Array.isArray(profile.priorities) &&
        profile.priorities.length >= 3 &&
        profile.priorities.every((p: any) => typeof p === 'string' && p.length > 0)
      );
    });

    expect(prioritiesValid).toBe(true);
  });

  test('should have typical questions for all stakeholders', async ({ page }) => {
    await page.goto('/');

    const questionsValid = await page.evaluate(async () => {
      const module = await import('/src/data/stakeholder-profiles.ts');

      return module.stakeholderProfiles.every((profile: any) =>
        Array.isArray(profile.typicalQuestions) &&
        profile.typicalQuestions.length >= 3 &&
        profile.typicalQuestions.every((q: any) => typeof q === 'string' && q.includes('?'))
      );
    });

    expect(questionsValid).toBe(true);
  });

  test('should have challenges array for all stakeholders', async ({ page }) => {
    await page.goto('/');

    const challengesValid = await page.evaluate(async () => {
      const module = await import('/src/data/stakeholder-profiles.ts');

      return module.stakeholderProfiles.every((profile: any) =>
        Array.isArray(profile.challenges) &&
        profile.challenges.length >= 2 &&
        profile.challenges.every((c: any) => typeof c === 'string' && c.length > 0)
      );
    });

    expect(challengesValid).toBe(true);
  });

  test('should have good practices for all stakeholders', async ({ page }) => {
    await page.goto('/');

    const practicesValid = await page.evaluate(async () => {
      const module = await import('/src/data/stakeholder-profiles.ts');

      return module.stakeholderProfiles.every((profile: any) =>
        Array.isArray(profile.goodPractices) &&
        profile.goodPractices.length >= 2 &&
        profile.goodPractices.every((p: any) => typeof p === 'string' && p.length > 0)
      );
    });

    expect(practicesValid).toBe(true);
  });

  test('should have concern text with placeholder for value insertion', async ({ page }) => {
    await page.goto('/');

    const placeholdersValid = await page.evaluate(async () => {
      const module = await import('/src/data/stakeholder-profiles.ts');

      return module.stakeholderProfiles.some((profile: any) =>
        profile.concernTriggers.some((trigger: any) =>
          trigger.concernText.includes('{value}')
        )
      );
    });

    expect(placeholdersValid).toBe(true);
  });

  test('should have Development Partners with debt sustainability concerns', async ({ page }) => {
    await page.goto('/');

    const devPartnersCorrect = await page.evaluate(async () => {
      const module = await import('/src/data/stakeholder-profiles.ts');
      const devPartners = module.getStakeholderById('development-partners');

      return (
        devPartners !== undefined &&
        devPartners.priorities.some((p: string) => p.toLowerCase().includes('debt sustainability')) &&
        devPartners.concernTriggers.some((t: any) =>
          t.explanation.toLowerCase().includes('debt sustainability')
        )
      );
    });

    expect(devPartnersCorrect).toBe(true);
  });

  test('should have Grid Operators with renewable integration concerns', async ({ page }) => {
    await page.goto('/');

    const gridOpsCorrect = await page.evaluate(async () => {
      const module = await import('/src/data/stakeholder-profiles.ts');
      const gridOps = module.getStakeholderById('grid-operators');

      return (
        gridOps !== undefined &&
        gridOps.priorities.some((p: string) => p.toLowerCase().includes('renewable integration')) &&
        gridOps.concernTriggers.some((t: any) =>
          t.metric.includes('renewableShare') || t.metric.includes('battery')
        )
      );
    });

    expect(gridOpsCorrect).toBe(true);
  });

  test('should have CSOs with climate ambition priorities', async ({ page }) => {
    await page.goto('/');

    const csosCorrect = await page.evaluate(async () => {
      const module = await import('/src/data/stakeholder-profiles.ts');
      const csos = module.getStakeholderById('csos-ngos');

      return (
        csos !== undefined &&
        csos.priorities.some((p: string) =>
          p.toLowerCase().includes('climate') || p.toLowerCase().includes('paris')
        ) &&
        csos.concernTriggers.some((t: any) =>
          t.metric.includes('emissions') || t.metric.includes('renewable')
        )
      );
    });

    expect(csosCorrect).toBe(true);
  });
});
