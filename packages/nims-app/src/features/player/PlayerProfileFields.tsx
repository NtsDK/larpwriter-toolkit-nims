import { ProfileFieldsForm, type ProfileFieldDef } from '@/components/ProfileFieldsForm';

export type PlayerFieldStructure = ProfileFieldDef;

interface PlayerProfileFieldsProps {
  structure: PlayerFieldStructure[];
  profile: Record<string, unknown>;
  profileType: 'player' | 'character' | 'questionnaire';
  entityName: string;
  onChange: (fieldName: string, itemType: string, value: unknown) => void | Promise<void>;
}

export function PlayerProfileFields({
  structure,
  profile,
  profileType,
  entityName,
  onChange,
}: PlayerProfileFieldsProps) {
  return (
    <ProfileFieldsForm
      structure={structure}
      profile={profile}
      entityKey={`${profileType}-${entityName}`}
      respectPlayerAccess
      canEdit
      emptyText={
        profileType === 'questionnaire'
          ? 'Анкета пока без полей. Организатор настроит её в разделе «Игроки» → «Анкета».'
          : 'Нет доступных полей для просмотра.'
      }
      onChange={onChange}
    />
  );
}
