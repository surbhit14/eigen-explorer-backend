import { ZodOpenApiOperationObject } from 'zod-openapi';
import { openApiErrorResponses } from '../../apiResponseSchema/base/errorResponses';
import { SummaryMetricsResponseSchema } from '../../apiResponseSchema/metrics/summaryMetricsResponse';

export const getAllMetrics: ZodOpenApiOperationObject = {
    operationId: 'getAllMetrics',
    summary: 'Retrieve summary metrics',
    description:
        'Returns summary metrics, including TVLs for both restaking strategies and the beacon chain ETH strategy, as well as the total number of AVS, operators, and stakers.',
    tags: ['Metrics'],
    requestParams: {},
    responses: {
        '200': {
            description: 'The list of summary metrics.',
            content: {
                'application/json': {
                    schema: SummaryMetricsResponseSchema,
                },
            },
        },
        ...openApiErrorResponses,
    },
};
