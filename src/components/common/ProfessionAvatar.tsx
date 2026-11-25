import React from 'react';
import bankerImg from '../../assets/images/char_banker_1795407453116.jpg';
import businessOwnerImg from '../../assets/images/char_business_owner_1795407486713.jpg';
import doctorImg from '../../assets/images/char_doctor_1795407452094.jpg';
import engineerImg from '../../assets/images/char_engineer_1795407452483.jpg';
import freelancerImg from '../../assets/images/char_freelancer_1795407666907.jpg';
import govtEmployeeImg from '../../assets/images/char_govt_employee_1795407452891.jpg';
import lawyerImg from '../../assets/images/char_lawyer_1795407451689.jpg';
import officeClerkImg from '../../assets/images/char_office_clerk_1795407452406.jpg';
import softwareDevImg from '../../assets/images/char_software_dev_1795407453037.jpg';
import teacherImg from '../../assets/images/char_teacher_1795407453109.jpg';

interface ProfessionAvatarProps {
  professionId: string;
  className?: string;
}

const PROFESSION_PORTRAITS: Record<string, string> = {
  teacher: teacherImg,
  doctor: doctorImg,
  engineer: engineerImg,
  government_employee: govtEmployeeImg,
  business_owner: businessOwnerImg,
  office_clerk: officeClerkImg,
  software_developer: softwareDevImg,
  lawyer: lawyerImg,
  banker: bankerImg,
  freelancer: freelancerImg,
};

/**
 * Stylized 3D character portraits for each of the 10 playable professions,
 * softly feathered at the perimeter so they blend seamlessly into the warm cream (#F6E7D7) canvas.
 */
export const ProfessionAvatar: React.FC<ProfessionAvatarProps> = ({
  professionId,
  className = 'w-48 h-48',
}) => {
  const src = PROFESSION_PORTRAITS[professionId] ?? teacherImg;

  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      draggable={false}
      referrerPolicy="no-referrer"
      className={`${className} object-cover object-top select-none cf-portrait-feather`}
    />
  );
};
