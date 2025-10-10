import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Ícone do logo (Gráfico Roxo - em formato de componente simples SVG)
const LogoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className="h-10 w-10 mx-auto" // Aumentado o tamanho para destaque
  >
    {/* As barras do gráfico, adaptadas para usar os tons de roxo do seu logo */}
    <rect x="3" y="15" width="4" height="6" fill="#8B5CF6" /> {/* Barra 1 */}
    <rect x="8" y="12" width="4" height="9" fill="#9333EA" /> {/* Barra 2 */}
    <rect x="13" y="9" width="4" height="12" fill="#A855F7" /> {/* Barra 3 */}
    <rect x="18" y="6" width="4" height="15" fill="#C084FC" /> {/* Barra 4 - Mais claro/vibrante */}
  </svg>
);


export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setSuccess('Conta criada com sucesso! Verifique seu email para confirmar.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dark min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl bg-card border border-border">
        <CardHeader className="space-y-3">
          {/* Logo Adicionado */}
          <LogoIcon />
          <CardTitle className="text-3xl font-bold text-center text-foreground">
            {isSignUp ? 'Criar Conta' : 'Bem-vindo'}
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            {isSignUp
              ? 'Crie sua conta para começar a gerenciar suas finanças'
              : 'Entre com suas credenciais para acessar sua conta'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              {/* Labels e Inputs padrão. As classes dos inputs no ShadCN-UI já se ajustam bem ao dark mode */}
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            {/* Botão com destaque Roxo */}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-colors"
              disabled={loading}
            >
              {loading ? 'Carregando...' : isSignUp ? 'Criar Conta' : 'Entrar'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            {/* Link de alternância com destaque Roxo */}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary hover:text-primary/80 transition-colors"
              disabled={loading}
            >
              {isSignUp ? 'Já tem uma conta? Entre aqui' : 'Não tem conta? Cadastre-se'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}