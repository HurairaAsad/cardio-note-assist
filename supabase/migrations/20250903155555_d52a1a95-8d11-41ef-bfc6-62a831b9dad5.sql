-- Create patients table
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  prn_mrn TEXT,
  facility TEXT,
  mr_source TEXT,
  provider TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create patient encounters table
CREATE TABLE public.patient_encounters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users,
  encounter_date DATE NOT NULL DEFAULT CURRENT_DATE,
  cpt_code TEXT,
  provider TEXT,
  facility TEXT,
  encounter_type TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create patient diagnoses table
CREATE TABLE public.patient_diagnoses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users,
  icd_code TEXT NOT NULL,
  diagnosis_name TEXT NOT NULL,
  category TEXT, -- 'cardiac', 'non-cardiac'
  is_active BOOLEAN DEFAULT true,
  diagnosed_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create patient medications table
CREATE TABLE public.patient_medications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users,
  medication_name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  category TEXT, -- 'cardiac', 'non-cardiac'
  is_active BOOLEAN DEFAULT true,
  started_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create patient procedures table
CREATE TABLE public.patient_procedures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users,
  procedure_name TEXT NOT NULL,
  procedure_date DATE,
  facility TEXT,
  provider TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create patient care team table
CREATE TABLE public.patient_care_team (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users,
  provider_type TEXT NOT NULL, -- 'primary_care', 'cardiologist', 'nephrologist', etc.
  provider_name TEXT,
  contact_info TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create patient vitals table
CREATE TABLE public.patient_vitals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users,
  measurement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  vital_type TEXT NOT NULL, -- 'vitals', 'coagulation_panel', 'kidney_function', 'troponin', 'bun'
  values JSONB, -- Store flexible key-value pairs for different vital types
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create patient social history table
CREATE TABLE public.patient_social_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users,
  tobacco_use TEXT,
  alcohol_use TEXT,
  drug_use TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create patient family history table
CREATE TABLE public.patient_family_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users,
  condition_name TEXT NOT NULL,
  relative TEXT NOT NULL, -- 'mother', 'father', 'sibling', etc.
  relative_age INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_encounters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_care_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_social_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_family_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for patients table
CREATE POLICY "Users can view their own patients" ON public.patients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own patients" ON public.patients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own patients" ON public.patients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own patients" ON public.patients FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for patient_encounters table
CREATE POLICY "Users can view their own patient encounters" ON public.patient_encounters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own patient encounters" ON public.patient_encounters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own patient encounters" ON public.patient_encounters FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own patient encounters" ON public.patient_encounters FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for patient_diagnoses table
CREATE POLICY "Users can view their own patient diagnoses" ON public.patient_diagnoses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own patient diagnoses" ON public.patient_diagnoses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own patient diagnoses" ON public.patient_diagnoses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own patient diagnoses" ON public.patient_diagnoses FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for patient_medications table
CREATE POLICY "Users can view their own patient medications" ON public.patient_medications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own patient medications" ON public.patient_medications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own patient medications" ON public.patient_medications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own patient medications" ON public.patient_medications FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for patient_procedures table
CREATE POLICY "Users can view their own patient procedures" ON public.patient_procedures FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own patient procedures" ON public.patient_procedures FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own patient procedures" ON public.patient_procedures FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own patient procedures" ON public.patient_procedures FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for patient_care_team table
CREATE POLICY "Users can view their own patient care team" ON public.patient_care_team FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own patient care team" ON public.patient_care_team FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own patient care team" ON public.patient_care_team FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own patient care team" ON public.patient_care_team FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for patient_vitals table
CREATE POLICY "Users can view their own patient vitals" ON public.patient_vitals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own patient vitals" ON public.patient_vitals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own patient vitals" ON public.patient_vitals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own patient vitals" ON public.patient_vitals FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for patient_social_history table
CREATE POLICY "Users can view their own patient social history" ON public.patient_social_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own patient social history" ON public.patient_social_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own patient social history" ON public.patient_social_history FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own patient social history" ON public.patient_social_history FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for patient_family_history table
CREATE POLICY "Users can view their own patient family history" ON public.patient_family_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own patient family history" ON public.patient_family_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own patient family history" ON public.patient_family_history FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own patient family history" ON public.patient_family_history FOR DELETE USING (auth.uid() = user_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patient_encounters_updated_at
  BEFORE UPDATE ON public.patient_encounters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patient_diagnoses_updated_at
  BEFORE UPDATE ON public.patient_diagnoses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patient_medications_updated_at
  BEFORE UPDATE ON public.patient_medications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patient_procedures_updated_at
  BEFORE UPDATE ON public.patient_procedures
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patient_care_team_updated_at
  BEFORE UPDATE ON public.patient_care_team
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patient_vitals_updated_at
  BEFORE UPDATE ON public.patient_vitals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patient_social_history_updated_at
  BEFORE UPDATE ON public.patient_social_history
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patient_family_history_updated_at
  BEFORE UPDATE ON public.patient_family_history
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_patients_user_id ON public.patients(user_id);
CREATE INDEX idx_patient_encounters_patient_id ON public.patient_encounters(patient_id);
CREATE INDEX idx_patient_encounters_user_id ON public.patient_encounters(user_id);
CREATE INDEX idx_patient_diagnoses_patient_id ON public.patient_diagnoses(patient_id);
CREATE INDEX idx_patient_medications_patient_id ON public.patient_medications(patient_id);
CREATE INDEX idx_patient_procedures_patient_id ON public.patient_procedures(patient_id);
CREATE INDEX idx_patient_care_team_patient_id ON public.patient_care_team(patient_id);
CREATE INDEX idx_patient_vitals_patient_id ON public.patient_vitals(patient_id);
CREATE INDEX idx_patient_social_history_patient_id ON public.patient_social_history(patient_id);
CREATE INDEX idx_patient_family_history_patient_id ON public.patient_family_history(patient_id);