import { Body, Controller, Get, Post } from '@nestjs/common';
import apiVersion from '../apiVersion.json';

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return 'API do Apoio Diário rodando! :)';
  }

  @Post('version/check')
  checkVersion(@Body() body: { appVersion: string }) {
    const { appVersion } = body;

    if (!appVersion) {
      return {
        compatible: false,
        apiVersion: apiVersion.apiVersion,
        appVersion: null,
        message: 'Versão do aplicativo não fornecida.',
      };
    }

    const compatible = apiVersion.compatibleAppVersions.includes(appVersion);

    return {
      compatible,
      apiVersion: apiVersion.apiVersion,
      appVersion,
      message: compatible
        ? 'Versão do aplicativo é compatível.'
        : 'Versão do aplicativo é incompatível. Por favor, atualize para a versão mais recente.',
    };
  }
}
