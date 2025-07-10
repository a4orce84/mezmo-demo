// OpenTelemetry Node.js log exporter setup
const { diag, DiagConsoleLogger, DiagLogLevel } = require("@opentelemetry/api");
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const { LoggerProvider, SimpleLogRecordProcessor } = require("@opentelemetry/sdk-logs");
const { OTLPLogExporter } = require("@opentelemetry/exporter-logs-otlp-http");

const provider = new LoggerProvider();
const exporter = new OTLPLogExporter({
  url: "http://otelcol:4318/v1/logs"
});
provider.addProcessor(new SimpleLogRecordProcessor(exporter));
provider.resource = provider.resource.merge(); // Ensure resource is set
const logger = provider.getLogger("backend-logger");

module.exports = logger;
