import React from 'react';
import { PersonalAssetId, TurnEventSummaryCard } from '../../types/game';

import clayInsuranceHealthImg from '../../assets/images/clay_insurance_health_1795582952109.webp';
import clayInsuranceAssetImg from '../../assets/images/clay_insurance_asset_1795582951915.webp';
import clayAssetCarImg from '../../assets/images/clay_asset_car_1795582953987.webp';
import clayAssetHouseImg from '../../assets/images/clay_asset_house_1795582953985.webp';
import clayAssetYachtImg from '../../assets/images/clay_asset_yacht_1795582954993.webp';
import clayAssetVillaImg from '../../assets/images/clay_asset_villa_1795582955763.webp';
import clayEduOnlineImg from '../../assets/images/clay_edu_online_1795582955861.webp';
import clayEduBooksImg from '../../assets/images/clay_edu_books_1795582956999.webp';
import clayEduDegreeImg from '../../assets/images/clay_edu_degree_1795582957458.webp';
import clayEduExchangeImg from '../../assets/images/clay_edu_exchange_1795582958371.webp';
import clayEduMbaImg from '../../assets/images/clay_edu_mba_1795583136103.webp';
import clayLotteryImg from '../../assets/images/clay_lottery_1795583136209.webp';
import clayReEconomyImg from '../../assets/images/clay_re_economy_1795582965510.webp';
import clayReStandardImg from '../../assets/images/clay_re_standard_1795583137045.webp';
import clayRePremiumImg from '../../assets/images/clay_re_premium_1795583137201.webp';
import clayReLuxuryImg from '../../assets/images/clay_re_luxury_1795583137907.webp';
import clayEventConferenceImg from '../../assets/images/clay_event_conference_1795583142701.webp';
import clayEventStocksImg from '../../assets/images/clay_event_stocks_1795583045626.webp';
import clayEventKioskImg from '../../assets/images/clay_event_kiosk_1795583046189.webp';
import clayEventRoyaltyImg from '../../assets/images/clay_event_royalty_1795583143535.webp';
import clayEventMedicalImg from '../../assets/images/clay_event_medical_1795582966362.webp';
import clayEventCarRepairImg from '../../assets/images/clay_event_car_repair_1795583141008.webp';
import clayEventExpenseImg from '../../assets/images/clay_event_expense_1795582967026.webp';
import clayEventBabyImg from '../../assets/images/clay_event_baby_1795583140288.webp';
import clayEventMilestoneImg from '../../assets/images/clay_event_milestone_1795583140191.webp';
import clayInflationCoinImg from '../../assets/images/clay_inflation_coin_1795582969122.webp';

const ClayIllustrationImg: React.FC<{
  src: string;
  className: string;
}> = ({ src, className }) => (
  <img
    src={src}
    alt=""
    aria-hidden="true"
    referrerPolicy="no-referrer"
    draggable={false}
    className={`${className} object-contain select-none pointer-events-none drop-shadow-[0_6px_10px_rgba(38,32,28,0.14)]`}
  />
);

export const InsuranceHealthIllustration: React.FC<{ className?: string }> = ({
  className = 'w-24 h-24',
}) => <ClayIllustrationImg src={clayInsuranceHealthImg} className={className} />;

export const InsuranceAssetIllustration: React.FC<{ className?: string }> = ({
  className = 'w-24 h-24',
}) => <ClayIllustrationImg src={clayInsuranceAssetImg} className={className} />;

const PERSONAL_ASSET_IMAGES: Record<PersonalAssetId, string> = {
  car: clayAssetCarImg,
  house: clayAssetHouseImg,
  yacht: clayAssetYachtImg,
  villa: clayAssetVillaImg,
};

export const PersonalAssetIllustration: React.FC<{
  assetId: PersonalAssetId;
  className?: string;
}> = ({ assetId, className = 'w-28 h-24' }) => (
  <ClayIllustrationImg
    src={PERSONAL_ASSET_IMAGES[assetId] ?? clayAssetHouseImg}
    className={className}
  />
);

export const HappinessIllustration: React.FC<{
  templateId?: string;
  itemId: string;
  className?: string;
}> = ({ templateId, itemId, className = 'w-28 h-24' }) => {
  const key = (templateId ?? itemId).toLowerCase();
  if (
    key.includes('book') ||
    key.includes('library') ||
    key.includes('kb') ||
    key.includes('desk') ||
    key.includes('gadget') ||
    key.includes('sim') ||
    key.includes('vr') ||
    key.includes('sketch') ||
    key.includes('studio') ||
    key.includes('camera')
  ) {
    return <ClayIllustrationImg src={clayEduOnlineImg} className={className} />;
  }
  if (
    key.includes('travel') ||
    key.includes('cruise') ||
    key.includes('resort') ||
    key.includes('hill') ||
    key.includes('island') ||
    key.includes('camp') ||
    key.includes('pilgrimage') ||
    key.includes('umrah') ||
    key.includes('hajj')
  ) {
    return <ClayIllustrationImg src={clayAssetVillaImg} className={className} />;
  }
  return <ClayIllustrationImg src={clayEventMilestoneImg} className={className} />;
};

export const VentureIllustration: React.FC<{ className?: string }> = ({
  className = 'w-24 h-24',
}) => <ClayIllustrationImg src={clayEventStocksImg} className={className} />;

export const LotteryIllustration: React.FC<{ className?: string }> = ({
  className = 'w-24 h-24',
}) => <ClayIllustrationImg src={clayLotteryImg} className={className} />;

const EDUCATION_TIER_IMAGES: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: clayEduOnlineImg,
  2: clayEduBooksImg,
  3: clayEduDegreeImg,
  4: clayEduExchangeImg,
  5: clayEduMbaImg,
};

export const EducationIllustration: React.FC<{
  tier: 1 | 2 | 3 | 4 | 5;
  className?: string;
}> = ({ tier, className = 'w-24 h-24' }) => (
  <ClayIllustrationImg
    src={EDUCATION_TIER_IMAGES[tier] ?? clayEduOnlineImg}
    className={className}
  />
);

function getEventIllustrationSrc(
  templateId: string,
  category: 'opportunity' | 'expense_emergency' | 'life_event'
): string {
  if (templateId === 'opp_stock_nvda_block' || templateId === 'opp_stock_vltg_block') {
    return clayEventStocksImg;
  }
  if (
    templateId === 'opp_property_distressed_duplex' ||
    templateId === 'opp_property_starter_condo'
  ) {
    return clayAssetHouseImg;
  }
  if (templateId === 'opp_business_kiosk_partner') {
    return clayEventKioskImg;
  }
  if (templateId === 'opp_side_consulting' || templateId === 'opp_medical_conference') {
    return clayEventConferenceImg;
  }
  if (templateId === 'opp_board_game_publish') {
    return clayEventKioskImg;
  }
  if (templateId === 'opp_royalty_license') {
    return clayEventRoyaltyImg;
  }
  if (templateId === 'char_opp_teacher' || templateId === 'char_opp_software_developer') {
    return templateId === 'char_opp_teacher' ? clayEduBooksImg : clayEduOnlineImg;
  }
  if (templateId === 'char_opp_doctor') {
    return clayEventMedicalImg;
  }
  if (templateId === 'char_opp_engineer' || templateId === 'char_opp_government_employee') {
    return clayEventKioskImg;
  }
  if (templateId === 'char_opp_business_owner' || templateId === 'char_opp_banker') {
    return clayEventStocksImg;
  }
  if (templateId === 'char_opp_office_clerk') {
    return clayEventRoyaltyImg;
  }
  if (templateId === 'char_opp_lawyer' || templateId === 'char_opp_freelancer') {
    return clayEventConferenceImg;
  }
  if (templateId === 'exp_medical') {
    return clayEventMedicalImg;
  }
  if (templateId === 'exp_car_repair') {
    return clayEventCarRepairImg;
  }
  if (templateId === 'exp_education') {
    return clayEduBooksImg;
  }
  if (category === 'expense_emergency') {
    return clayEventExpenseImg;
  }
  if (templateId === 'life_new_baby') {
    return clayEventBabyImg;
  }
  if (templateId === 'life_property_boom') {
    return clayRePremiumImg;
  }
  if (templateId === 'life_market_crash') {
    return clayInflationCoinImg;
  }
  if (templateId === 'life_divorce' || templateId === 'life_salary_cut') {
    return clayEventExpenseImg;
  }
  return clayEventMilestoneImg;
}

export const EventCardIllustration: React.FC<{
  templateId: string;
  category: 'opportunity' | 'expense_emergency' | 'life_event';
  className?: string;
}> = ({ templateId, category, className = 'w-20 h-20 sm:w-24 sm:h-24' }) => (
  <ClayIllustrationImg
    src={getEventIllustrationSrc(templateId, category)}
    className={className}
  />
);

const REAL_ESTATE_TIER_IMAGES: Record<'economy' | 'standard' | 'premium' | 'luxury', string> = {
  economy: clayReEconomyImg,
  standard: clayReStandardImg,
  premium: clayRePremiumImg,
  luxury: clayReLuxuryImg,
};

export const RealEstateTierIllustration: React.FC<{
  tier: 'economy' | 'standard' | 'premium' | 'luxury';
  className?: string;
}> = ({ tier, className = 'w-32 h-32' }) => (
  <ClayIllustrationImg
    src={REAL_ESTATE_TIER_IMAGES[tier] ?? clayReEconomyImg}
    className={className}
  />
);

export const TurnSummaryEventIllustration: React.FC<{
  kind: TurnEventSummaryCard['kind'];
  templateId?: string;
  isInsuredCard?: boolean;
  className?: string;
}> = ({
  kind,
  templateId,
  isInsuredCard = false,
  className = 'h-16 w-16 sm:h-20 sm:w-20 mx-auto',
}) => {
  let src = clayEventMilestoneImg;

  if (kind === 'inflation') {
    src = clayInflationCoinImg;
  } else if (kind === 'lottery_win' || kind === 'lottery_loss' || templateId === 'lottery') {
    src = clayLotteryImg;
  } else if (isInsuredCard) {
    src = clayInsuranceHealthImg;
  } else if (templateId) {
    const inferredCategory: 'opportunity' | 'expense_emergency' | 'life_event' =
      templateId.startsWith('exp_')
        ? 'expense_emergency'
        : templateId.startsWith('life_')
          ? 'life_event'
          : 'opportunity';
    src = getEventIllustrationSrc(templateId, inferredCategory);
  } else {
    switch (kind) {
      case 'venture_win':
        src = clayEventStocksImg;
        break;
      case 'venture_loss':
        src = clayEventExpenseImg;
        break;
      case 'black_swan':
        src = clayInflationCoinImg;
        break;
      case 'accident':
        src = clayEventMedicalImg;
        break;
      case 'baby':
        src = clayEventBabyImg;
        break;
      case 'divorce':
      case 'tax_zakat':
        src = clayEventExpenseImg;
        break;
      case 'new_events':
        src = clayEventConferenceImg;
        break;
      case 'resolved_event':
      default:
        src = clayEventMilestoneImg;
        break;
    }
  }

  return <ClayIllustrationImg src={src} className={className} />;
};
