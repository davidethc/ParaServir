import axios from "axios";

interface UpdateUserPayload {
  email: string;
  password?: string;
  first_name: string;
  last_name: string;
  phone: string;
  location?: string;
}

export const updateUser = async (userId: string, data: UpdateUserPayload) => {
  const response = await axios.put(`/users/edit/${userId}`, data, {
    withCredentials: true, // cookies (JWT)
  });

  return response.data;
};
