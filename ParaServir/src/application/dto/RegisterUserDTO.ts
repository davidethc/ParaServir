export class RegisterUserDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  cedula: string;
  phone: string;
  location: string;
  isWorker: boolean;
  categories: string[];

  constructor({
    email,
    password,
    firstName,
    lastName,
    cedula,
    phone,
    location,
    isWorker,
    categories = []
  }: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    cedula: string;
    phone: string;
    location: string;
    isWorker: boolean;
    categories?: string[];
  }) {
    this.email = email;
    this.password = password;
    this.firstName = firstName;
    this.lastName = lastName;
    this.cedula = cedula;
    this.phone = phone;
    this.location = location;
    this.isWorker = isWorker;
    this.categories = categories;
  }
}

