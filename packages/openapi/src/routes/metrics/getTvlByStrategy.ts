import { ZodOpenApiOperationObject } from 'zod-openapi';
import { openApiErrorResponses } from '../../apiResponseSchema/base/errorResponses';
import { IndividualStrategyTvlResponseSchema } from '../../apiResponseSchema/metrics/tvlResponse';
import z from '../../../../api/src/schema/zod';

const RestakingStrategyNameParam = z.object({
    strategy: z
        .string()
        .describe('The name of the restaking strategy')
        .openapi({ example: 'cbETH' }),
});

export const getTvlRestakingMetricByStrategy: ZodOpenApiOperationObject = {
    operationId: 'getTvlRestakingMetricByStrategy',
    summary: 'Retrieve a strategy TVL by name',
    description:
        'Returns the total value locked (TVL) in a specific LST strategy.',
    tags: ['Metrics'],
    requestParams: {
        path: RestakingStrategyNameParam,
    },
    responses: {
        '200': {
            description:
                'The value of combined restaking strategy TVL and a breakdown of the TVL for each individual strategy.',
            content: {
                'application/json': {
                    schema: IndividualStrategyTvlResponseSchema,
                },
            },
        },
        ...openApiErrorResponses,
    },
};
