import { ZodOpenApiOperationObject } from 'zod-openapi';
import { openApiErrorResponses } from '../../apiResponseSchema/base/errorResponses';
import z from '../../../../api/src/schema/zod';
import { EthereumAddressSchema } from '../../../../api/src/schema/zod/schemas/base/ethereumAddress';
import { IndividualOperatorResponseSchema } from '../../apiResponseSchema/operatorResponse';

const OperatorAddressParam = z.object({
    address: EthereumAddressSchema.describe(
        'The address of the operator.'
    ).openapi({ example: '0x00107cfdeaddc0a3160ed2f6fedd627f313e7b1b' }),
});

export const getOperatorByAddress: ZodOpenApiOperationObject = {
    operationId: 'getOperatorByAddress',
    summary: 'Retrieve an operator by address',
    description: 'Returns an operator record by address.',
    tags: ['Operators'],
    requestParams: {
        path: OperatorAddressParam,
    },
    responses: {
        '200': {
            description: 'The record of the requested operator.',
            content: {
                'application/json': {
                    schema: IndividualOperatorResponseSchema,
                },
            },
        },
        ...openApiErrorResponses,
    },
};
