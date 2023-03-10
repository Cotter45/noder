import * as RL from 'readline';
import * as FS from 'fs';
import * as Path from 'path';

const rl = RL.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const handleResource = (resourceName: string) => {
  // determine singular and plural versions of the resource name
  const singular = resourceName.endsWith('s')
    ? resourceName.slice(0, -1)
    : resourceName;
  const plural = singular.endsWith('y')
    ? `${singular.slice(0, -1)}ies`
    : `${singular}s`;

  // create the directory for the resource in app/routes
  const resourceDir = Path.join(__dirname, 'app', 'routes', resourceName);
  if (!FS.existsSync(resourceDir)) {
    FS.mkdirSync(resourceDir);
  }

  const upperFirstSingular = singular[0].toUpperCase() + singular.slice(1);
  const upperFirstPlural = plural[0].toUpperCase() + plural.slice(1);

  // the folder names for the resource
  const folders = [
    `get${upperFirstSingular}`,
    `get${upperFirstPlural}`,
    `create${upperFirstSingular}`,
    `update${upperFirstSingular}`,
    `delete${upperFirstSingular}`,
  ];

  // create the folders for the resource
  folders.forEach((folder) => {
    const folderPath = Path.join(resourceDir, folder);
    if (!FS.existsSync(folderPath)) {
      FS.mkdirSync(folderPath);
    }
  });

  // create the index.ts file for the resource
  const indexFile = Path.join(resourceDir, 'index.ts');
  const indexContent = `import { Router } from '../../../lib/router';
import * as ${folders[0]} from './${folders[0]}';
import * as ${folders[1]} from './${folders[1]}';
import * as ${folders[2]} from './${folders[2]}';
import * as ${folders[3]} from './${folders[3]}';
import * as ${folders[4]} from './${folders[4]}';

export const router = new Router('/${plural}');

router.get('/:id', ${folders[0]}.handler);
router.get('/', ${folders[1]}.handler);
router.post('/', ${folders[2]}.handler);
router.patch('/:id', ${folders[3]}.handler);
router.delete('/:id', ${folders[4]}.handler);

export default router;
`;

  FS.writeFileSync(indexFile, indexContent);

  const handlerContent = `import type { ICtx } from '../../../../lib/types';

export const handler = async (ctx: ICtx) => {
  ctx.res.status(200).json({ message: 'Hello World!' });
};
`;

  // create the handler files for the resource
  folders.forEach((folder) => {
    const handlerFile = Path.join(resourceDir, folder, 'handler.ts');

    FS.writeFileSync(handlerFile, handlerContent);
  });

  const validatorContent = `import type { IRequest, IResponse, INextFunction } from '../../../../lib/types';

export const validator = (
  req: IRequest,
  res: IResponse,
  next: INextFunction,
) => {
  next();
};
`;

  // create the validator files for the resource
  folders.forEach((folder) => {
    const validatorFile = Path.join(resourceDir, folder, 'validator.ts');

    FS.writeFileSync(validatorFile, validatorContent);
  });

  const testContent = `import { handler } from './handler';
import { validator } from './validator';

describe('Handler', () => {
  it('should be defined', () => {
    expect(handler).toBeDefined();
  });
});

describe('Validator', () => {
  it('should be defined', () => {
    expect(validator).toBeDefined();
  });
});
`;

  // create the test files for the resource
  folders.forEach((folder) => {
    const testFile = Path.join(resourceDir, folder, `${folder}.spec.ts`);

    FS.writeFileSync(testFile, testContent);
  });

  // create the index.ts file for each folder
  folders.forEach((folder) => {
    const folderPath = Path.join(resourceDir, folder);
    const folderIndexFile = Path.join(folderPath, 'index.ts');
    const folderIndexContent = `export * from './handler';
export * from './validator';
`;

    FS.writeFileSync(folderIndexFile, folderIndexContent);
  });

  // end readline
  rl.close();
};

// Take in the name of the resource to create routes for
rl.question('What is the name of the resource? ', handleResource);
