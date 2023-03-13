import { assertValid } from 'frisker'
import { defaultPresets, presetValidator } from '../../../common/presets'
import { store } from '../../db'
import { handle } from '../wrap'

export const getUserPresets = handle(async ({ userId }) => {
  const presets = await store.users.getUserPresets(userId!)
  return { presets }
})

export const getBasePresets = handle(async () => {
  return { presets: defaultPresets }
})

export const createUserPreset = handle(async ({ userId, body }) => {
  assertValid(presetValidator, body)

  const preset = { ...body }
  if (!preset.order?.length) {
    preset.order = undefined
  }

  const newPreset = await store.users.createUserPreset(userId!, preset)
  return newPreset
})

export const updateUserPreset = handle(async ({ params, body, userId }) => {
  assertValid(presetValidator, body)

  const preset = await store.users.updateUserPreset(userId!, params.id, body)
  return preset
})

export const deleteUserPreset = handle(async ({ params }) => {
  await store.users.deleteUserPreset(params.id)

  return { success: true }
})