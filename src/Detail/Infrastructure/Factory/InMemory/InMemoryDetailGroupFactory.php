<?php
namespace Affilicious\Detail\Infrastructure\Factory\InMemory;

use Affilicious\Common\Domain\Model\Key;
use Affilicious\Common\Domain\Model\Name;
use Affilicious\Common\Domain\Model\Title;
use Affilicious\Detail\Domain\Model\Detail\Detail;
use Affilicious\Detail\Domain\Model\Detail\Value;
use Affilicious\Detail\Domain\Model\DetailGroup;
use Affilicious\Detail\Domain\Model\DetailGroupFactoryInterface;
use Affilicious\Detail\Domain\Model\DetailTemplateGroupId;
use Affilicious\Detail\Domain\Model\DetailTemplateGroupRepositoryInterface;
use Affilicious\Detail\Domain\Model\Detail\Type;
use Affilicious\Detail\Domain\Model\Detail\Unit;

if(!defined('ABSPATH')) {
    exit('Not allowed to access pages directly.');
}

class InMemoryDetailGroupFactory implements DetailGroupFactoryInterface
{
    /**
     * @var DetailTemplateGroupRepositoryInterface
     */
    private $detailTemplateGroupRepository;

    /**
     * @since 0.6
     * @param DetailTemplateGroupRepositoryInterface $detailTemplateGroupRepository
     */
    public function __construct(DetailTemplateGroupRepositoryInterface $detailTemplateGroupRepository)
    {
        $this->detailTemplateGroupRepository = $detailTemplateGroupRepository;
    }

    /**
     * @inheritdoc
     * @since 0.6
     */
    public function create(Title $title, Name $name, Key $key)
    {
        $detailGroup = new DetailGroup($title, $name, $key);

        return $detailGroup;
    }

    /**
     * @inheritdoc
     * @since 0.6
     */
    public function createFromTemplateIdAndData(DetailTemplateGroupId $detailTemplateGroupId, $data)
    {
        $detailTemplateGroup = $this->detailTemplateGroupRepository->findById($detailTemplateGroupId);
        if($detailTemplateGroup === null || !is_array($data)) {
            return null;
        }

        $detailGroup = $this->create(
            $detailTemplateGroup->getTitle(),
            $detailTemplateGroup->getName(),
            $detailTemplateGroup->getKey()
        );

        $detailGroup->setTemplateId($detailTemplateGroupId);

        $detailTemplates = $detailTemplateGroup->getDetailTemplates();
        foreach ($detailTemplates as $detailTemplate) {
            $detail = new Detail(
                $detailTemplate->getTitle(),
                $detailTemplate->getName(),
                $detailTemplate->getKey(),
                new Type($detailTemplate->getType()->getValue())
            );

            if($detailTemplate->hasUnit()) {
                $detail->setUnit(new Unit($detailTemplate->getUnit()->getValue()));
            }

            if(!empty($data[$detail->getKey()->getValue()])) {
                $value = $data[$detail->getKey()->getValue()];

                // Convert the string into a float, if the type is numeric
                $value = $detail->getType()->isEqualTo(Type::number()) ? floatval($value) : $value;

                $detail->setValue(new Value($value));
            }

            $detailGroup->addDetail($detail);
        }

        return $detailGroup;
    }
}