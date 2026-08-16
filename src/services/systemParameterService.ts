import axiosClient from '../api/axiosClient'

export interface SystemParameterDto {
  id: number
  bikeDepositAmount: number
  carDepositPercentage: number
  contactPhone: string
  cancellationRefundDays: number
}

export interface SystemParameterUpdateDto {
  bikeDepositAmount: number
  carDepositPercentage: number
  contactPhone: string
  cancellationRefundDays: number
}

export const systemParameterService = {
  getSystemParameter: (): Promise<SystemParameterDto> => {
    return axiosClient.get('/system-parameters')
  },

  updateSystemParameter: (data: SystemParameterUpdateDto): Promise<SystemParameterDto> => {
    return axiosClient.put('/system-parameters', data)
  }
}
