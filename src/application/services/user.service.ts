import { errorMessages, StatusCode } from "../../common/constant.js";
import { UserSummary } from "../../domain/entities/user.entity.js";
import { IUserRepository } from "../../domain/repositories/user.repository.js";
import { ApiError } from "../../utils/ApiError.js";

export class UserService {
  constructor(private readonly userRepository: IUserRepository) {}

  async getPendingApprovals(): Promise<UserSummary[]> {
    return this.userRepository.findPendingApprovals();
  }

  async approveUser(serialNumber: number): Promise<UserSummary[]> {
    const approvedUser = await this.userRepository.updateBySerialNumber(
      serialNumber,
      { isActive: false, isEmailVerified: true },
      { isActive: true },
    );

    if (!approvedUser) {
      throw new ApiError(StatusCode.BADREQUEST, errorMessages.userNotExistWithRequest);
    }

    return this.userRepository.findPendingApprovals();
  }

  async rejectUser(serialNumber: number): Promise<UserSummary[]> {
    const rejectedUser = await this.userRepository.updateBySerialNumber(
      serialNumber,
      { isActive: false, isEmailVerified: true },
      { isEmailVerified: false },
    );

    if (!rejectedUser) {
      throw new ApiError(StatusCode.BADREQUEST, errorMessages.userNotExistWithRequest);
    }

    return this.userRepository.findPendingApprovals();
  }

  async findBySerialNumber(serialNumber: number) {
    const user = await this.userRepository.findBySerialNumber(serialNumber);
    if (!user) {
      throw new ApiError(StatusCode.BADREQUEST, errorMessages.userNotExist);
    }
    return user;
  }
}
