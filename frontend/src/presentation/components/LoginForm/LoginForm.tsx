import React, { useState } from "react";
import {
  Box,
  Button,
  Field,
  Fieldset,
  Input,
  Heading,
  Alert,
  VStack,
} from "@chakra-ui/react";
import { LoginUser } from "../../../application/use-cases/loginUser";
import { AuthRepositoryImpl } from "../../../infrastructure/repositories/AuthRepositoryImpl";

// 🔑 Interfaz para inyección de dependencias
interface LoginFormProps {
  loginUseCase?: LoginUser;
  onLoginSuccess?: () => void;
}

// 📝 Interfaz para el estado del formulario
interface LoginFormState {
  email: string;
  password: string;
  error: string | null;
  loading: boolean;
}

// 🎯 Custom hook para manejar la lógica del formulario
const useLoginForm = (
  loginUseCase: LoginUser,
  onLoginSuccess?: () => void
) => {
  const [formState, setFormState] = useState<LoginFormState>({
    email: "",
    password: "",
    error: null,
    loading: false,
  });

  const updateField = (field: keyof LoginFormState, value: any) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (!formState.email || !formState.password) {
      updateField('error', 'Email y contraseña son requeridos');
      return;
    }

    updateField('loading', true);
    updateField('error', null);

    try {
      await loginUseCase.execute(formState.email, formState.password);
      onLoginSuccess?.();
    } catch (err: any) {
      updateField('error', err.message || "Error desconocido al iniciar sesión");
    } finally {
      updateField('loading', false);
    }
  };

  return {
    formState,
    updateField,
    handleSubmit,
  };
};

// 🎨 Componente principal con responsabilidad única
const LoginForm: React.FC<LoginFormProps> = ({
  loginUseCase = new LoginUser(new AuthRepositoryImpl()),
  onLoginSuccess,
}) => {
  const { formState, updateField, handleSubmit } = useLoginForm(
    loginUseCase,
    onLoginSuccess
  );

  return (
    <Box
      // Mobile-first: diseño optimizado para móviles
      w="100%"
      maxW={{ base: "90vw", sm: "400px" }}
      mx="auto"
      mt={{ base: 4, md: 12 }}
      p={{ base: 4, md: 8 }}
      borderWidth="1px"
      borderRadius="2xl"
      boxShadow="md"
      bg="white"
    >
      <Heading 
        size={{ base: "md", md: "lg" }} 
        textAlign="center" 
        mb={{ base: 4, md: 6 }}
      >
        Iniciar Sesión
      </Heading>

      {/* Componente de error separado */}
      {formState.error && (
        <Alert.Root status="error" mb={4}>
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Error</Alert.Title>
            <Alert.Description>{formState.error}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}

      <form onSubmit={handleSubmit}>
        <VStack gap={{ base: 4, md: 6 }} align="stretch">
          <Fieldset.Root size={{ base: "md", md: "lg" }}>
            <Fieldset.Content>
              <Field.Root>
                <Field.Label>Correo electrónico</Field.Label>
                <Input
                  name="email"
                  type="email"
                  value={formState.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="tu@email.com"
                  size={{ base: "md", md: "lg" }}
                  required
                  autoComplete="email"
                />
                <Field.HelperText>
                  Ingresa tu dirección de correo electrónico
                </Field.HelperText>
              </Field.Root>

              <Field.Root>
                <Field.Label>Contraseña</Field.Label>
                <Input
                  name="password"
                  type="password"
                  value={formState.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  placeholder="••••••••"
                  size={{ base: "md", md: "lg" }}
                  required
                  autoComplete="current-password"
                />
                <Field.HelperText>
                  Ingresa tu contraseña
                </Field.HelperText>
              </Field.Root>
            </Fieldset.Content>

            <Button
              type="submit"
              disabled={formState.loading}
              loading={formState.loading}
              loadingText="Iniciando sesión..."
              colorScheme="blue"
              size={{ base: "md", md: "lg" }}
              w="100%"
              mt={4}
            >
              {formState.loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </Fieldset.Root>
        </VStack>
      </form>
    </Box>
  );
};

export default LoginForm;