import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCircle, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { playerSchema } from "@/lib/validationSchemas";

interface PlayerSetupProps {
  sessionName: string;
  onPlayerCreate: (playerName: string, profession: string) => void;
}

const professions = ["Teacher", "Engineer", "Doctor", "Lawyer", "Business Owner"] as const;

export const PlayerSetup = ({ sessionName, onPlayerCreate }: PlayerSetupProps) => {
  const [playerName, setPlayerName] = useState("");
  const [profession, setProfession] = useState<string>("Teacher");
  const [errors, setErrors] = useState<{ playerName?: string; profession?: string }>({});

  const handleSubmit = () => {
    const result = playerSchema.safeParse({ playerName, profession });
    if (!result.success) {
      const fieldErrors: { playerName?: string; profession?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === 'playerName') fieldErrors.playerName = err.message;
        if (err.path[0] === 'profession') fieldErrors.profession = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    onPlayerCreate(result.data.playerName, result.data.profession);
  };

  const handleNameChange = (value: string) => {
    setPlayerName(value);
    if (errors.playerName) {
      const result = playerSchema.shape.playerName.safeParse(value);
      if (result.success) {
        setErrors((prev) => ({ ...prev, playerName: undefined }));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/20 p-4 flex items-center justify-center">
      <Card className="w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <UserCircle className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-primary">Player Setup</h1>
            <p className="text-sm text-muted-foreground">Session: {sessionName}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="playerName">Your Name</Label>
            <Input
              id="playerName"
              placeholder="Enter your name..."
              value={playerName}
              onChange={(e) => handleNameChange(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
              maxLength={30}
            />
            {errors.playerName && (
              <p className="text-sm text-destructive">{errors.playerName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="profession">Choose Profession</Label>
            <select
              id="profession"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border bg-background"
            >
              {professions.map((prof) => (
                <option key={prof} value={prof}>
                  {prof}
                </option>
              ))}
            </select>
            {errors.profession && (
              <p className="text-sm text-destructive">{errors.profession}</p>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!playerName.trim()}
            className="w-full"
            size="lg"
          >
            Start Playing
          </Button>

          <Link to="/leagues" className="block">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full gap-2"
            >
              <Users className="w-5 h-5" />
              Multiplayer Leagues
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
