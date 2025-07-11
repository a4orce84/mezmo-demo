// OpenTelemetry tracing for React (browser)
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';

const otlpTraceUrl = window.location.hostname === 'localhost'
  ? 'http://localhost:4318/v1/traces'
  : 'https://mezmo-plkw4.ondigitalocean.app/mezmo-demo-otelcol/v1/traces'; // Use your deployed otelcol public URL for production
const exporter = new OTLPTraceExporter({ url: otlpTraceUrl });
const provider = new WebTracerProvider({
  spanProcessors: [new BatchSpanProcessor(exporter)]
});
provider.register();

registerInstrumentations({
  instrumentations: [
    new FetchInstrumentation({
      propagateTraceHeaderCorsUrls: [/.*/],
    }),
  ],
});

export const tracer = provider.getTracer('frontend-tracer');
