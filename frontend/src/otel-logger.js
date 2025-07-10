// OpenTelemetry JS log exporter setup for React (browser)
import { LoggerProvider, SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-otlp-http';

const provider = new LoggerProvider();
const otlpUrl = window.location.hostname === 'localhost'
  ? 'http://localhost:4318/v1/logs'
  : 'http://otelcol:4318/v1/logs';
const exporter = new OTLPLogExporter({
  url: otlpUrl
});
provider.addLogRecordProcessor(new SimpleLogRecordProcessor(exporter));
provider.register();

const logger = provider.getLogger('frontend-logger');

export default logger;
