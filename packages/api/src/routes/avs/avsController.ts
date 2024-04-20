import type { Request, Response } from 'express';
import { PaginationQuerySchema } from '../../schema/generic';
import prisma from '../../prisma/prismaClient';
import { getEigenContracts } from '../../data/address';

/**
 * Route to get a list of all AVSs
 *
 * @param req
 * @param res
 */
export async function getAllAVS(req: Request, res: Response) {
    try {
        // Validate pagination query
        const {
            error,
            value: { skip, take },
        } = PaginationQuerySchema.validate(req.query);
        if (error)
            return res.status(422).json({ error: error.details[0].message });

        // Fetch count and record
        const avsCount = await prisma.avs.count();
        const avsRecords = await prisma.avs.findMany({ skip, take });

        const data = await Promise.all(
            avsRecords.map(async (avs) => {
                const operatorAddresses = avs.operators
                    .filter((o) => o.isActive)
                    .map((o) => o.address);
                const operators = await prisma.operator.aggregate({
                    where: { address: { in: operatorAddresses } },
                    _sum: {
                        totalStakers: true,
                    },
                });

                const totalOperators = operatorAddresses.length;
                const totalStakers = operators._sum.totalStakers || 0;

                return {
                    ...avs,
                    totalOperators,
                    totalStakers,
                    operators: undefined,
                };
            })
        );

        res.send({
            data,
            meta: {
                total: avsCount,
                skip,
                take,
            },
        });
    } catch (error) {
        res.status(400).send({
            error: 'An error occurred while fetching data',
        });
    }
}

/**
 * Route to get a list of all AVS and their addresses
 *
 * @param req
 * @param res
 */
export async function getAllAVSAddresses(req: Request, res: Response) {
    console.log('in route');
    try {
        // Validate pagination query
        const {
            error,
            value: { skip, take },
        } = PaginationQuerySchema.validate(req.query);
        if (error)
            return res.status(422).json({ error: error.details[0].message });

        // Fetch count and records
        const avsCount = await prisma.avs.count();
        const avsRecords = await prisma.avs.findMany({ skip, take });

        // Simplified map (assuming avs.address is not asynchronous)
        const data = avsRecords.map((avs) => ({
            name: avs.metadata.name,
            address: avs.address,
        }));

        // Send response with data and metadata
        res.send({
            data,
            meta: {
                total: avsCount,
                skip,
                take,
            },
        });
    } catch (error) {
        res.status(400).send({
            error: 'An error occurred while fetching data',
        });
    }
}

/**
 * Route to get a single AVS
 *
 * @param req
 * @param res
 */
export async function getAVS(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const avs = await prisma.avs.findUniqueOrThrow({
            where: { address: id },
        });

        const strategyKeys = Object.keys(getEigenContracts().Strategies);
        const strategyContracts = strategyKeys.map(
            (s) => getEigenContracts().Strategies[s].strategyContract
        ) as `0x${string}`[];

        const shares = strategyContracts.map((sc) => ({
            shares: '0',
            strategy: sc,
        }));

        const operatorAddresses = avs.operators
            .filter((o) => o.isActive)
            .map((o) => o.address);
        const operatorRecords = await prisma.operator.findMany({
            where: { address: { in: operatorAddresses } },
            select: { shares: true, totalStakers: true },
        });

        let tvl = 0;
        let totalStakers = 0;
        const totalOperators = operatorAddresses.length;

        operatorRecords.map((o) => {
            o.shares.map((os) => {
                const foundShare = shares.find(
                    (s) => s.strategy === os.strategy
                );
                if (foundShare) {
                    const shares =
                        BigInt(foundShare.shares) + BigInt(os.shares);
                    foundShare.shares = shares.toString();
                }

                tvl += Number(os.shares) / 1e18;
            });

            totalStakers += o.totalStakers;
        });

        res.send({
            ...avs,
            shares,
            tvl,
            totalOperators,
            totalStakers,
            operators: undefined,
        });
    } catch (error) {
        res.status(400).send({
            error: 'An error occurred while fetching data',
        });
    }
}
