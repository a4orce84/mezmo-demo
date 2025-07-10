// OpenTelemetry tracing for React (browser)
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';

const provider = new WebTracerProvider();
const otlpTraceUrl = window.location.hostname === 'localhost'
  ? 'http://localhost:4318/v1/traces'
  : 'https://YOUR_OTELCOL_URL/v1/traces'; // Replace with your collector's public URL for production
const exporter = new OTLPTraceExporter({ url: otlpTraceUrl });
provider.addSpanProcessor(new BatchSpanProcessor(exporter));
provider.register();

registerInstrumentations({
  instrumentations: [
    new FetchInstrumentation({
      propagateTraceHeaderCorsUrls: [/.*/],
    }),
  ],
});

export const tracer = provider.getTracer('frontend-tracer');
