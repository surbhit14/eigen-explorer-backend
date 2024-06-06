import 'dotenv/config'

import { seedAvs } from './seedAvs'
import { seedAvsOperators } from './seedAvsOperators'
import { seedOperators } from './seedOperators'
import { seedPods } from './seedPods'
import { seedStakers } from './seedStakers'
import { getViemClient } from './utils/viemClient'
import { seedBlockData } from './blocks/seedBlockData'
import { seedLogsAVSMetadata } from './events/seedLogsAVSMetadata'
import { seedLogsOperatorMetadata } from './events/seedLogsOperatorMetadata'
import { seedLogsOperatorAVSRegistrationStatus } from './events/seedLogsOperatorAVSRegistrationStatus'
import { seedLogsOperatorShares } from './events/seedLogsOperatorShares'
import { seedLogsStakerDelegation } from './events/seedLogsStakerDelegation'
import { seedLogsPodDeployed } from './events/seedLogsPodDeployed'
import { seedOperatorShares } from './seedOperatorShares'
import { seedValidators } from './seedValidators'
import { seedQueuedWithdrawals } from './seedWithdrawalsQueued'
import { seedCompletedWithdrawals } from './seedWithdrawalsCompleted'

console.log('Initializing seeder ...')

function delay(seconds: number) {
	return new Promise((resolve) => setTimeout(resolve, seconds * 1000))
}

async function seedEventLogsLoop() {
	while (true) {
		try {
			const viemClient = getViemClient()
			const targetBlock = await viemClient.getBlockNumber()
			console.log('Seeding Block and Log Data ...', targetBlock)

			await seedBlockData(targetBlock)
			await seedLogsAVSMetadata(targetBlock)
			await seedLogsOperatorMetadata(targetBlock)
			await seedLogsOperatorAVSRegistrationStatus(targetBlock)
			await seedLogsOperatorShares(targetBlock)
			await seedLogsStakerDelegation(targetBlock)
			await seedLogsPodDeployed(targetBlock)
		} catch (error) {
			console.log('Failed to seed Block and Log Data at:', Date.now())
			console.log(error)
		}

		await delay(30)
	}
}

async function seedEigenDataLoop() {
	await delay(60)

	while (true) {
		try {
			console.log('Seeding Eigen Data ...')

			await seedAvs()
			await seedOperators()
			await seedAvsOperators()
			await seedStakers()
			await seedOperatorShares()
			await seedQueuedWithdrawals()
			await seedCompletedWithdrawals()
		} catch (error) {
			console.log('Failed to seed AVS and Operators at:', Date.now())
			console.log(error)
		}

		await delay(120) // Wait for 2 minutes (120 seconds)
	}
}

async function seedEigenPodValidators() {
	await delay(60)

	while (true) {
		try {
			console.log('Seeding Eigen Pods Data ...')

			await seedPods()
			await seedValidators()
		} catch (error) {
			console.log('Failed to seed validators at block:', Date.now())
			console.log(error)
		}

		await delay(600) // Wait for 10 minutes (600 seconds)
	}
}

seedEventLogsLoop()
seedEigenDataLoop()
seedEigenPodValidators()
