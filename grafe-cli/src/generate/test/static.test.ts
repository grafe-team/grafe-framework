import 'mocha';
import rewire = require('rewire');
import Sinon = require('sinon');
import messages from '../generate.messages';
import * as chai from 'chai';

describe('static.generate.ts file', () => {
  let staticGenerate = rewire('../static.generate');

  beforeEach(() => {
    staticGenerate = rewire('../static.generate');
  });

  describe('generateStatic function', () => {
    const consoleErrorStub = Sinon.stub();
    const consoleLogStub = Sinon.stub();
    const existsSyncStub = Sinon.stub();
    const promptStub = Sinon.stub();
    const mkdirpStub = Sinon.stub();
    const pkgDirStub = Sinon.stub();

    let generateStatic: (name: string) => Promise<void> =
      staticGenerate.__get__('generateStatic');

    const fsMock = {
      existsSync: existsSyncStub,
    };

    const inquirerMock = {
      prompt: promptStub,
    };

    const mkdirpMock = {
      default: mkdirpStub,
    };

    const pkgDirMock = {
      default: pkgDirStub,
    };

    beforeEach(() => {
      consoleLogStub.reset();
      consoleErrorStub.reset();

      staticGenerate.__set__({
        console: {
          error: consoleErrorStub,
          log: consoleLogStub,
        },
      });

      staticGenerate.__set__({
        fs: fsMock,
        inquirer: inquirerMock,
        mkdirp: mkdirpMock,
        pkgDir: pkgDirMock,
      });

      generateStatic = staticGenerate.__get__('generateStatic');

      promptStub.reset();
      mkdirpStub.reset();
      pkgDirStub.reset();
      existsSyncStub.reset();
    });

    it('should abort when not confirming the prompt', async () => {
      promptStub.resolves({ confirm: false });

      await generateStatic('test');

      chai
        .expect(promptStub.callCount)
        .to.deep.eq(1, 'prompt should be called once');
      chai
        .expect(consoleErrorStub.callCount)
        .to.deep.eq(0, 'console.error should not be called once');
      chai
        .expect(consoleLogStub.callCount)
        .to.deep.eq(0, 'console.log should not be called once');
    });

    it('should log an error when length is 0', async () => {
      promptStub.resolves({ confirm: true });

      await generateStatic('');

      chai
        .expect(promptStub.callCount)
        .to.deep.eq(1, 'prompt should be called once');
      chai
        .expect(consoleErrorStub.callCount)
        .to.deep.eq(1, 'console.error should be called once');
      chai
        .expect(consoleLogStub.callCount)
        .to.deep.eq(0, 'console.log should not be called once');
      chai
        .expect(
          consoleErrorStub.calledOnceWith(messages.generateStatic.to_small)
        )
        .to.be.eq(true, 'console.error should be called with to_small message');
    });

    it('should log an error when colon is in name', async () => {
      promptStub.resolves({ confirm: true });

      await generateStatic('test:');

      chai
        .expect(promptStub.callCount)
        .to.deep.eq(1, 'prompt should be called once');
      chai
        .expect(consoleErrorStub.callCount)
        .to.deep.eq(1, 'console.error should be called once');
      chai
        .expect(consoleLogStub.callCount)
        .to.deep.eq(0, 'console.log should not be called once');
      chai
        .expect(
          consoleErrorStub.calledOnceWith(messages.generateStatic.no_colon)
        )
        .to.be.eq(true, 'console.error should be called with no_colon message');
    });

    it('should log an error when file already exists', async () => {
      promptStub.resolves({ confirm: true });
      pkgDirStub.resolves('C:\\grafe\\project_1');
      existsSyncStub.returns(true);

      await generateStatic('test');

      chai
        .expect(promptStub.callCount)
        .to.deep.eq(1, 'prompt should be called once');
      chai
        .expect(consoleErrorStub.callCount)
        .to.deep.eq(1, 'console.error should be called once');
      chai
        .expect(consoleLogStub.callCount)
        .to.deep.eq(0, 'console.log should not be called once');
      chai
        .expect(consoleErrorStub.calledOnceWith(messages.generateStatic.exists))
        .to.be.eq(true, 'console.error should be called with exists message');
    });

    it('should log an error when file already exists', async () => {
      promptStub.resolves({ confirm: true });
      pkgDirStub.resolves('C:\\grafe\\project_1');
      existsSyncStub.returns(false);

      await generateStatic('test');

      chai
        .expect(promptStub.callCount)
        .to.deep.eq(1, 'prompt should be called once');
      chai
        .expect(consoleErrorStub.callCount)
        .to.deep.eq(0, 'console.error should not be called once');
      chai
        .expect(consoleLogStub.callCount)
        .to.deep.eq(1, 'console.log should be called once');
      chai
        .expect(mkdirpStub.lastCall.args[0])
        .to.deep.eq(
          'C:\\grafe\\project_1\\src\\static\\test',
          'should be this exact path'
        );
    });
  });

  describe('generateStaticHandler function', () => {
    const consoleErrorStub = Sinon.stub();
    const existsSyncStub = Sinon.stub();
    const promptStub = Sinon.stub();
    const mkdirpStub = Sinon.stub();
    const pkgDirStub = Sinon.stub();
    const generateStaticStub = Sinon.stub();

    let generateStaticHandler: (
      argv: Record<string, unknown>
    ) => Promise<void> = staticGenerate.__get__('generateStaticHandler');

    const fsMock = {
      existsSync: existsSyncStub,
    };

    const inquirerMock = {
      prompt: promptStub,
    };

    const pkgDirMock = {
      default: pkgDirStub,
    };

    beforeEach(() => {
      consoleErrorStub.reset();

      staticGenerate.__set__({
        generateStatic: generateStaticStub,
      });

      staticGenerate.__set__({
        console: {
          error: consoleErrorStub,
        },
      });

      staticGenerate.__set__({
        fs: fsMock,
        inquirer: inquirerMock,
        pkgDir: pkgDirMock,
      });

      generateStaticHandler = staticGenerate.__get__('generateStaticHandler');

      promptStub.reset();
      mkdirpStub.reset();
      pkgDirStub.reset();
      existsSyncStub.reset();
    });

    it('should log an error when not in a grafe project', async () => {
      pkgDirStub.resolves('C:\\grafe\\project_1');
      existsSyncStub.returns(false);

      await generateStaticHandler({});

      chai
        .expect(consoleErrorStub.callCount)
        .to.deep.eq(1, 'console.error should be called once');
      chai
        .expect(consoleErrorStub.calledOnceWith(messages.not_grafe))
        .to.be.eq(
          true,
          'console.error should be called with not_grafe message'
        );
    });

    it('should prompt the user when name not given', async () => {
      pkgDirStub.resolves('C:\\grafe\\project_1');
      existsSyncStub.returns(true);
      promptStub.resolves({ name: 'Test' });

      await generateStaticHandler({});

      chai
        .expect(consoleErrorStub.callCount)
        .to.deep.eq(0, 'console.error should not be called once');
      chai
        .expect(promptStub.callCount)
        .to.deep.eq(1, 'user should be prompted once');
      chai
        .expect(generateStaticStub.lastCall.args[0])
        .to.deep.eq('Test', 'should be the string of the prompt');
    });

    it('should not prompt the user when name given', async () => {
      pkgDirStub.resolves('C:\\grafe\\project_1');
      existsSyncStub.returns(true);

      await generateStaticHandler({ name: 'Test' });

      chai
        .expect(consoleErrorStub.callCount)
        .to.deep.eq(0, 'console.error should not be called once');
      chai
        .expect(promptStub.callCount)
        .to.deep.eq(0, 'user should not be prompted');
      chai
        .expect(generateStaticStub.lastCall.args[0])
        .to.deep.eq('Test', 'should be the string of the prompt');
    });
  });
});
