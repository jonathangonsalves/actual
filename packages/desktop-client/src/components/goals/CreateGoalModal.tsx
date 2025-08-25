import React, { useState } from 'react';

import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import { Text } from '@actual-app/components/text';
import { Button } from '@actual-app/components/button';
import { Input } from '@actual-app/components/input';
import {
  Modal,
  ModalCloseButton,
  ModalHeader,
} from '@desktop-client/components/common/Modal';

interface CreateGoalModalProps {
  onSave: (goalData: any) => void;
  onClose: () => void;
}

const predefinedColors = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Yellow
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#84cc16', // Lime
  '#ec4899', // Pink
  '#6b7280', // Gray
];

export function CreateGoalModal({ onSave, onClose }: CreateGoalModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    target_amount: '',
    target_date: '',
    tag_pattern: '',
    color: predefinedColors[0],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Goal name is required';
    }

    if (!formData.target_amount || parseFloat(formData.target_amount) <= 0) {
      newErrors.target_amount = 'Target amount must be greater than 0';
    }

    if (!formData.tag_pattern.trim()) {
      newErrors.tag_pattern = 'Tag pattern is required';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.tag_pattern)) {
      newErrors.tag_pattern = 'Tag pattern can only contain letters, numbers, and underscores';
    }

    if (formData.target_date && new Date(formData.target_date) <= new Date()) {
      newErrors.target_date = 'Target date must be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const goalData = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      target_amount: Math.round(parseFloat(formData.target_amount) * 100), // Convert to cents
      target_date: formData.target_date || undefined,
      tag_pattern: formData.tag_pattern.trim(),
      color: formData.color,
    };

    onSave(goalData);
  };

  return (
    <Modal name="create-goal" onClose={onClose}>
      <ModalHeader
        title="Create New Goal"
        rightContent={<ModalCloseButton onPress={onClose} />}
      />
      
      <View style={{ padding: 20, minWidth: 500 }}>
        {/* Goal Name */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: theme.pageTextDark,
              marginBottom: 8,
            }}
          >
            Goal Name *
          </Text>
          <Input
            value={formData.name}
            onChangeValue={value => handleInputChange('name', value)}
            placeholder="e.g., New Car, Emergency Fund, Vacation"
            style={{
              borderColor: errors.name ? theme.errorBorder : theme.formInputBorder,
            }}
          />
          {errors.name && (
            <Text style={{ color: theme.errorText, fontSize: 12, marginTop: 4 }}>
              {errors.name}
            </Text>
          )}
        </View>

        {/* Description */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: theme.pageTextDark,
              marginBottom: 8,
            }}
          >
            Description
          </Text>
          <Input
            value={formData.description}
            onChangeValue={value => handleInputChange('description', value)}
            placeholder="Optional description of your goal"
          />
        </View>

        {/* Target Amount */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: theme.pageTextDark,
              marginBottom: 8,
            }}
          >
            Target Amount *
          </Text>
          <Input
            value={formData.target_amount}
            onChangeValue={value => handleInputChange('target_amount', value)}
            placeholder="25000"
            type="number"
            style={{
              borderColor: errors.target_amount ? theme.errorBorder : theme.formInputBorder,
            }}
          />
          {errors.target_amount && (
            <Text style={{ color: theme.errorText, fontSize: 12, marginTop: 4 }}>
              {errors.target_amount}
            </Text>
          )}
        </View>

        {/* Target Date */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: theme.pageTextDark,
              marginBottom: 8,
            }}
          >
            Target Date
          </Text>
          <Input
            value={formData.target_date}
            onChangeValue={value => handleInputChange('target_date', value)}
            type="date"
            style={{
              borderColor: errors.target_date ? theme.errorBorder : theme.formInputBorder,
            }}
          />
          {errors.target_date && (
            <Text style={{ color: theme.errorText, fontSize: 12, marginTop: 4 }}>
              {errors.target_date}
            </Text>
          )}
        </View>

        {/* Tag Pattern */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: theme.pageTextDark,
              marginBottom: 8,
            }}
          >
            Tag Pattern *
          </Text>
          <Input
            value={formData.tag_pattern}
            onChangeValue={value => handleInputChange('tag_pattern', value)}
            placeholder="goal_car"
            style={{
              borderColor: errors.tag_pattern ? theme.errorBorder : theme.formInputBorder,
            }}
          />
          <Text
            style={{
              fontSize: 12,
              color: theme.pageTextSubdued,
              marginTop: 4,
            }}
          >
            Transactions with tags containing this pattern will count toward this goal.
            Example: #goal_car, #car_fund, etc.
          </Text>
          {errors.tag_pattern && (
            <Text style={{ color: theme.errorText, fontSize: 12, marginTop: 4 }}>
              {errors.tag_pattern}
            </Text>
          )}
        </View>

        {/* Color Selection */}
        <View style={{ marginBottom: 30 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: theme.pageTextDark,
              marginBottom: 12,
            }}
          >
            Color
          </Text>
          <View
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 10,
            }}
          >
            {predefinedColors.map(color => (
              <Button
                key={color}
                variant="bare"
                onPress={() => handleInputChange('color', color)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: color,
                  border: formData.color === color 
                    ? `3px solid ${theme.pageTextDark}` 
                    : `2px solid ${theme.tableBorder}`,
                  cursor: 'pointer',
                }}
              />
            ))}
          </View>
        </View>

        {/* Actions */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            gap: 12,
            paddingTop: 20,
            borderTop: `1px solid ${theme.tableBorder}`,
          }}
        >
          <Button variant="bare" onPress={onClose}>
            <Text style={{ color: theme.pageTextSubdued }}>Cancel</Text>
          </Button>
          <Button
            variant="primary"
            onPress={handleSubmit}
            style={{
              backgroundColor: theme.buttonPrimaryBackground,
              paddingHorizontal: 20,
              paddingVertical: 10,
            }}
          >
            <Text style={{ color: theme.buttonPrimaryText, fontWeight: '600' }}>
              Create Goal
            </Text>
          </Button>
        </View>
      </View>
    </Modal>
  );
}
