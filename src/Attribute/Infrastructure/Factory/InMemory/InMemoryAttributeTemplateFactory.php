<?php
namespace Affilicious\Attribute\Infrastructure\Factory\InMemory;

use Affilicious\Attribute\Domain\Model\Attribute\AttributeTemplate;
use Affilicious\Attribute\Domain\Model\Attribute\AttributeTemplateFactoryInterface;
use Affilicious\Attribute\Domain\Model\Attribute\Type;
use Affilicious\Common\Domain\Model\Title;

if(!defined('ABSPATH')) {
    exit('Not allowed to access pages directly.');
}

class InMemoryAttributeTemplateFactory implements AttributeTemplateFactoryInterface
{
    /**
     * @inheritdoc
     * @since 0.6
     */
    public function create(Title $title, Type $type)
    {
        $name = $title->toName();
        $attributeTemplate = new AttributeTemplate(
            $title,
            $name,
            $name->toKey(),
            $type
        );

        return $attributeTemplate;
    }
}