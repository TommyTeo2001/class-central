import type { Schema, Attribute } from '@strapi/strapi';

export interface SharedSeo extends Schema.Component {
  collectionName: 'components_shared_seos';
  info: {
    displayName: 'seo';
    icon: 'search';
    description: '';
  };
  attributes: {
    metaTitle: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
    metaDescription: Attribute.Text &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 260;
      }>;
    metaImage: Attribute.Media<'images' | 'files' | 'videos'>;
    metaSocial: Attribute.Component<'shared.meta-social', true>;
    keywords: Attribute.Text;
    metaRobots: Attribute.String;
    structuredData: Attribute.JSON;
    metaViewport: Attribute.String;
    canonicalURL: Attribute.String;
  };
}

export interface SharedProfileCard extends Schema.Component {
  collectionName: 'components_shared_profile_cards';
  info: {
    displayName: 'ProfileCard';
    description: '';
  };
  attributes: {
    image: Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    name: Attribute.String;
    description: Attribute.Text;
    title: Attribute.Text;
  };
}

export interface SharedMetaSocial extends Schema.Component {
  collectionName: 'components_shared_meta_socials';
  info: {
    displayName: 'metaSocial';
    icon: 'project-diagram';
  };
  attributes: {
    socialNetwork: Attribute.Enumeration<['Facebook', 'Twitter']> &
      Attribute.Required;
    title: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
    description: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 65;
      }>;
    image: Attribute.Media<'images' | 'files' | 'videos'>;
  };
}

export interface SharedButton extends Schema.Component {
  collectionName: 'components_shared_buttons';
  info: {
    displayName: 'Button';
  };
  attributes: {
    label: Attribute.String;
    variant: Attribute.Enumeration<
      ['primary', 'secondary', 'light', 'dark', 'danger', 'sea']
    > &
      Attribute.DefaultTo<'primary'>;
    href: Attribute.String & Attribute.Required;
    target: Attribute.Enumeration<['_blank', '_self']> &
      Attribute.DefaultTo<'_self'>;
    isExternal: Attribute.Boolean & Attribute.DefaultTo<false>;
    size: Attribute.Enumeration<['small', 'medium', 'large']> &
      Attribute.DefaultTo<'medium'>;
  };
}

export interface GeneralCollectionTypeStatus extends Schema.Component {
  collectionName: 'components_general_collection_type_statuses';
  info: {
    displayName: 'Collection Type Status';
  };
  attributes: {
    status: Attribute.Enumeration<['Active', 'In Active']> &
      Attribute.Required &
      Attribute.DefaultTo<'Active'>;
  };
}

export interface CourseLesson extends Schema.Component {
  collectionName: 'components_course_lessons';
  info: {
    displayName: 'Course Lesson';
    description: '';
  };
  attributes: {
    lessonName: Attribute.String;
    lessonDescription: Attribute.RichText;
  };
}

export interface CourseCourseLessons extends Schema.Component {
  collectionName: 'components_course_course_lessons';
  info: {
    displayName: 'Course Section';
    description: '';
  };
  attributes: {
    sectionTitle: Attribute.String;
    lessons: Attribute.Component<'course.lesson', true>;
  };
}

export interface BlocksVideo extends Schema.Component {
  collectionName: 'components_blocks_videos';
  info: {
    displayName: 'Video';
  };
  attributes: {
    name: Attribute.String;
    media: Attribute.Media<'images' | 'files' | 'videos' | 'audios', true>;
    description: Attribute.RichText;
  };
}

export interface BlocksTestimonials extends Schema.Component {
  collectionName: 'components_blocks_testimonials';
  info: {
    displayName: 'Testimonials';
    description: '';
  };
  attributes: {
    profileCard: Attribute.Component<'shared.profile-card', true>;
    isFullWidth: Attribute.Boolean & Attribute.DefaultTo<false>;
  };
}

export interface BlocksRelatedCourses extends Schema.Component {
  collectionName: 'components_blocks_related_courses';
  info: {
    displayName: 'Courses';
    icon: 'apps';
    description: '';
  };
  attributes: {
    courseName: Attribute.String & Attribute.Required;
  };
}

export interface BlocksReflection extends Schema.Component {
  collectionName: 'components_blocks_reflections';
  info: {
    displayName: 'Reflection';
  };
  attributes: {
    title: Attribute.String & Attribute.Required;
    description: Attribute.RichText;
    reflectionItems: Attribute.Component<'blocks.reflection-item', true>;
  };
}

export interface BlocksReflectionItem extends Schema.Component {
  collectionName: 'components_blocks_reflection_items';
  info: {
    displayName: 'reflection-item';
  };
  attributes: {
    itemTitle: Attribute.String & Attribute.Required;
    itemDescription: Attribute.RichText & Attribute.Required;
  };
}

export interface BlocksReading extends Schema.Component {
  collectionName: 'components_blocks_readings';
  info: {
    displayName: 'Reading';
  };
  attributes: {
    name: Attribute.String;
    description: Attribute.RichText;
  };
}

export interface BlocksProductSlider extends Schema.Component {
  collectionName: 'components_blocks_product_sliders';
  info: {
    displayName: 'ProductSlider';
  };
  attributes: {
    title: Attribute.String;
    categories: Attribute.Relation<
      'blocks.product-slider',
      'oneToOne',
      'api::category.category'
    >;
    courseOfferings: Attribute.Relation<
      'blocks.product-slider',
      'oneToMany',
      'api::course-offering.course-offering'
    >;
    classrooms: Attribute.Relation<
      'blocks.product-slider',
      'oneToMany',
      'api::classroom.classroom'
    >;
    buttons: Attribute.Component<'shared.button', true>;
    productsToShow: Attribute.Integer;
  };
}

export interface BlocksPartnersSlider extends Schema.Component {
  collectionName: 'components_blocks_partners_sliders';
  info: {
    displayName: 'PartnersSlider';
    description: '';
  };
  attributes: {
    textAboveMainHeader: Attribute.String;
    mainHeader: Attribute.Text;
    subHeader: Attribute.Text;
    partners: Attribute.Relation<
      'blocks.partners-slider',
      'oneToMany',
      'api::center-partner.center-partner'
    >;
  };
}

export interface BlocksLink extends Schema.Component {
  collectionName: 'components_blocks_links';
  info: {
    displayName: 'Link';
    description: '';
  };
  attributes: {
    title: Attribute.String & Attribute.Required;
    description: Attribute.Text;
    url: Attribute.String & Attribute.Required;
  };
}

export interface BlocksHero extends Schema.Component {
  collectionName: 'components_blocks_heroes';
  info: {
    displayName: 'Hero';
    description: '';
  };
  attributes: {
    layoutTypes: Attribute.Enumeration<['Layout 1', 'Layout 2']> &
      Attribute.Required &
      Attribute.DefaultTo<'Layout 1'>;
    headingAboveHeroText: Attribute.String;
    heroTextFirstLine: Attribute.JSON &
      Attribute.CustomField<'plugin::list-tags.listTags'>;
    heroTextSecondLine: Attribute.String;
    heroTextSubheading: Attribute.String;
    image: Attribute.Media<'images'>;
    buttons: Attribute.Component<'shared.button', true>;
    isFullWidth: Attribute.Boolean & Attribute.DefaultTo<false>;
  };
}

export interface BlocksFullWidthEmailCapture extends Schema.Component {
  collectionName: 'components_blocks_full_width_email_captures';
  info: {
    displayName: 'FullWidthEmailCapture';
    description: '';
  };
  attributes: {
    smallText: Attribute.String;
    headerText: Attribute.Text;
    href: Attribute.Text;
    buttonFullWidthEmail: Attribute.Component<'shared.button'>;
    isFullWidth: Attribute.Boolean & Attribute.DefaultTo<true>;
  };
}

export interface BlocksFullWidthCta extends Schema.Component {
  collectionName: 'components_blocks_full_width_ctas';
  info: {
    displayName: 'FullWidthCTA';
    description: '';
  };
  attributes: {
    smallText: Attribute.String;
    CTAText: Attribute.Text;
    href: Attribute.Text;
    isFullWidth: Attribute.Boolean & Attribute.DefaultTo<true>;
  };
}

export interface BlocksFeatureHighlight extends Schema.Component {
  collectionName: 'components_blocks_feature_highlights';
  info: {
    displayName: 'FeatureHighlight';
    description: '';
  };
  attributes: {
    textAboveMainHeader: Attribute.Text;
    mainHeader: Attribute.Text;
    subHeader: Attribute.Text;
    details: Attribute.Text;
    image: Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    buttonFeatureHighlight: Attribute.Component<'shared.button'>;
    isFullWidth: Attribute.Boolean & Attribute.DefaultTo<false>;
  };
}

export interface BlocksCourseOfferings extends Schema.Component {
  collectionName: 'components_blocks_course_offerings';
  info: {
    displayName: 'CourseOfferings';
    description: '';
  };
  attributes: {
    courseOffering: Attribute.Relation<
      'blocks.course-offerings',
      'oneToOne',
      'api::course-offering.course-offering'
    >;
  };
}

export interface BlocksCenterPartnerSlider extends Schema.Component {
  collectionName: 'components_blocks_center_partner_sliders';
  info: {
    displayName: 'CenterPartnerSlider';
    description: '';
  };
  attributes: {
    textAboveMainHeader: Attribute.String;
    mainHeader: Attribute.Text;
    subHeader: Attribute.Text;
    centerPartners: Attribute.Relation<
      'blocks.center-partner-slider',
      'oneToMany',
      'api::center-partner.center-partner'
    >;
    isFullWidth: Attribute.Boolean & Attribute.DefaultTo<false>;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'shared.seo': SharedSeo;
      'shared.profile-card': SharedProfileCard;
      'shared.meta-social': SharedMetaSocial;
      'shared.button': SharedButton;
      'general.collection-type-status': GeneralCollectionTypeStatus;
      'course.lesson': CourseLesson;
      'course.course-lessons': CourseCourseLessons;
      'blocks.video': BlocksVideo;
      'blocks.testimonials': BlocksTestimonials;
      'blocks.related-courses': BlocksRelatedCourses;
      'blocks.reflection': BlocksReflection;
      'blocks.reflection-item': BlocksReflectionItem;
      'blocks.reading': BlocksReading;
      'blocks.product-slider': BlocksProductSlider;
      'blocks.partners-slider': BlocksPartnersSlider;
      'blocks.link': BlocksLink;
      'blocks.hero': BlocksHero;
      'blocks.full-width-email-capture': BlocksFullWidthEmailCapture;
      'blocks.full-width-cta': BlocksFullWidthCta;
      'blocks.feature-highlight': BlocksFeatureHighlight;
      'blocks.course-offerings': BlocksCourseOfferings;
      'blocks.center-partner-slider': BlocksCenterPartnerSlider;
    }
  }
}
