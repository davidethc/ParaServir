import { LoginUseCase } from "../../../application/use-cases/login.use-case";
import { RegisterUseCase } from "../../../application/use-cases/register.use-case";
import type { LoginDto, LoginResponseDto } from "../../../application/dto/login.dto";
import type { RegisterDto, RegisterResponseDto } from "../../../application/dto/register.dto";
import { API_CONFIG } from "../api.config";

export class AuthController {
    private loginUseCase: LoginUseCase;
    private registerUseCase: RegisterUseCase;

    constructor(apiUrl?: string) {
        const backendUrl = apiUrl || API_CONFIG.baseUrl;
        this.loginUseCase = new LoginUseCase(backendUrl);
        this.registerUseCase = new RegisterUseCase(backendUrl);
    }

    async login(dto: LoginDto): Promise<LoginResponseDto> {
        return await this.loginUseCase.execute(dto);
    }

    async register(dto: RegisterDto): Promise<RegisterResponseDto> {
        return await this.registerUseCase.execute(dto);
    }
}

