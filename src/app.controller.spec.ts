import { AppController } from './app.controller';

describe('verificação de compatibilidade de versões', () => {
  const controller = new AppController();

  it.each(['1.1.0', '1.2.0'])('aceita o aplicativo %s', (appVersion) => {
    expect(controller.checkVersion({ appVersion })).toMatchObject({
      compatible: true,
      apiVersion: '1.1.0',
      appVersion,
    });
  });

  it.each(['1.0.1', '1.2.1', ''])('rejeita a versão %s', (appVersion) => {
    expect(controller.checkVersion({ appVersion })).toMatchObject({
      compatible: false,
      apiVersion: '1.1.0',
    });
  });
});
