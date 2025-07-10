// OpenTelemetry Node.js log exporter setup
const { diag, DiagConsoleLogger, DiagLogLevel } = require("@opentelemetry/api");
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const { LoggerProvider } = require("@opentelemetry/sdk-logs");
const { OTLPLogExporter } = require("@opentelemetry/exporter-otlp-http");

const provider = new LoggerProvider();
const exporter = new OTLPLogExporter({
  url: "http://otelcol:4318/v1/logs"
});
provider.addLogRecordProcessor(new (require("@opentelemetry/sdk-logs").SimpleLogRecordProcessor)(exporter));
provider.register();

const logger = provider.getLogger("backend-logger");

module.exports = logger;
