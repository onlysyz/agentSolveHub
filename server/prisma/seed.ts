import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      nickname: 'DemoUser',
      role: 'admin',
      emailVerified: true,
    },
  });

  // Create sample problems
  const problems = [
    {
      title: 'Chrome Extension Upload Button Not Clickable',
      summary: 'The upload button in Chrome extension appears disabled when trying to upload files',
      goal: 'Upload files using Chrome extension file picker',
      platformName: 'Chrome',
      taskType: 'upload',
      osType: 'Windows 11',
      softwareVersion: '120.0.6099.130',
      language: 'en',
      errorMessage: 'Button is greyed out and not responding to clicks',
      status: 'available',
      verificationStatus: 'verified',
      createdById: demoUser.id,
    },
    {
      title: 'Notion API Database Filter Not Working',
      summary: 'Using database filtering with multi-select property returns empty results',
      goal: 'Filter Notion database entries by multi-select property',
      platformName: 'Notion',
      taskType: 'api',
      osType: 'macOS',
      softwareVersion: '2.1.5',
      language: 'en',
      errorMessage: 'Filter returns 0 results even when matching entries exist',
      status: 'available',
      verificationStatus: 'community_verified',
      createdById: demoUser.id,
    },
    {
      title: 'CapCut Export Failed with Memory Error',
      summary: 'Exporting 4K video fails with out of memory error on 32GB RAM system',
      goal: 'Export finished video project to 4K MP4 format',
      platformName: 'CapCut',
      taskType: 'export',
      osType: 'Windows 11',
      softwareVersion: '5.3.0',
      language: 'zh-CN',
      errorMessage: 'Out of memory. Required: 8GB, Available: 4GB',
      status: 'available',
      verificationStatus: 'verified',
      createdById: demoUser.id,
    },
  ];

  for (const problem of problems) {
    const created = await prisma.problem.create({ data: problem });

    // Add a solution for each problem
    await prisma.solution.create({
      data: {
        problemId: created.id,
        title: `Solution for: ${created.title}`,
        applicableEnvironment: JSON.stringify({
          os: created.osType,
          version: created.softwareVersion,
          language: created.language,
        }),
        rootCause: 'This is a common issue caused by incorrect API parameters or version mismatch.',
        steps: JSON.stringify([
          { title: 'Step 1: Check API Version', description: 'Verify you are using the latest API version' },
          { title: 'Step 2: Clear Cache', description: 'Clear browser cache and restart the application' },
          { title: 'Step 3: Retry Operation', description: 'Retry the failed operation with updated parameters' },
        ]),
        alternativePaths: JSON.stringify([
          { title: 'Alternative: Restart Application', description: 'Force quit and restart the application' },
        ]),
        verificationMethod: 'Verify the operation completes without errors and expected output is generated',
        invalidConditions: 'This solution may not work if the software version is older than 2.0',
        verificationStatus: created.verificationStatus,
        verifiedAt: new Date(),
        verificationCount: 3,
        createdById: demoUser.id,
      },
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
