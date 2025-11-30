import type { AvatarUrl } from "./AvatarUrl";
import type { Cedula } from "./Cedula";
import type { FirstName } from "./FirstName";
import type { LastName } from "./LastName";
import type { Phone } from "./Phone";
import type { ProfileCreatedAt } from "./ProfileCreatedAt";
import type { ProfileId } from "./ProfileId";
import type { UserId } from "./UserId";


export class Profile {
  id: ProfileId;
  userId: UserId;
  firstName: FirstName;
  lastName: LastName;
  cedula: Cedula;
  phone: Phone;
  location: Location;
  avatarUrl: AvatarUrl;
  createdAt: ProfileCreatedAt;
  updatedAt: Date;

  constructor(
    id: ProfileId,
    userId: UserId,
    firstName: FirstName,
    lastName: LastName,
    cedula: Cedula,
    phone: Phone,
    location: Location,
    avatarUrl: AvatarUrl,
    createdAt: ProfileCreatedAt
  ) {
    this.id = id;
    this.userId = userId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.cedula = cedula;
    this.phone = phone;
    this.location = location;
    this.avatarUrl = avatarUrl;
    this.createdAt = createdAt;
    this.updatedAt = new Date();
  }
}

